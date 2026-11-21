import { ethers } from 'ethers';
import { 
  BASE_SEPOLIA_CHAIN_ID_HEX, 
  BASE_SEPOLIA_CONFIG, 
  USDC_CONTRACT_ADDRESS, 
  SHOP_CONTRACT_ADDRESS, 
  ERC20_ABI, 
  SHOP_ABI 
} from './web3Config.js';

class Web3Manager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.shopContract = null;
    this.usdcContract = null;
    this.account = null;
    this.isConnecting = false;
    this.shopAddress = ethers.utils.getAddress(SHOP_CONTRACT_ADDRESS);

    const saved = localStorage.getItem('zootoss_shop_addr');
    if (saved) {
      try {
        this.shopAddress = ethers.utils.getAddress(saved);
      } catch (e) {
        localStorage.removeItem('zootoss_shop_addr');
      }
    }
  }

  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  }

  async connectWallet() {
    if (!this.isMetaMaskAvailable()) {
      alert("MetaMask / Web3 Wallet tidak ditemukan! Silakan instal ekstensi MetaMask.");
      return null;
    }

    try {
      this.isConnecting = true;
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");

      const accounts = await this.provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("Akun tidak ditemukan");
      }

      this.account = accounts[0];
      this.signer = this.provider.getSigner();

      // Pastikan di jaringan Base Sepolia
      await this.switchToBaseSepolia();

      this.shopContract = new ethers.Contract(this.shopAddress, SHOP_ABI, this.signer);
      this.usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, this.signer);

      window.ethereum.on('accountsChanged', (accs) => {
        if (accs.length === 0) {
          this.disconnect();
        } else {
          this.account = accs[0];
          this.signer = this.provider.getSigner();
          this.shopContract = new ethers.Contract(this.shopAddress, SHOP_ABI, this.signer);
          this.usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, this.signer);
          window.dispatchEvent(new CustomEvent('web3:accountChanged', { detail: this.account }));
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return this.account;
    } catch (err) {
      console.error("Gagal menghubungkan wallet:", err);
      alert("Gagal menghubungkan wallet: " + (err.message || err));
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  async switchToBaseSepolia() {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_SEPOLIA_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
  }

  async getUsdcBalance() {
    if (!this.usdcContract || !this.account) return '0.00';
    try {
      const bal = await this.usdcContract.balanceOf(this.account);
      return ethers.utils.formatUnits(bal, 6);
    } catch (e) {
      console.warn("Gagal membaca balance USDC:", e);
      return '0.00';
    }
  }

  /**
   * Pembelian item shop dengan token USDC
   * @param {number} itemId 1 atau 2
   * @param {string} usdcAmountStr e.g. "0.1" atau "0.5"
   */
  async buyShopItem(itemId, usdcAmountStr) {
    if (!this.account) {
      const connected = await this.connectWallet();
      if (!connected) return false;
    }

    try {
      await this.switchToBaseSepolia();
      const usdcUnits = ethers.utils.parseUnits(usdcAmountStr, 6);

      // 1. Cek saldo USDC
      const balance = await this.usdcContract.balanceOf(this.account);
      if (balance.lt(usdcUnits)) {
        throw new Error(`Saldo USDC tidak mencukupi! Butuh ${usdcAmountStr} USDC (Base Sepolia).`);
      }

      // 2. Cek apakah butuh approve USDC
      const currentAllowance = await this.usdcContract.allowance(this.account, this.shopAddress);
      if (currentAllowance.lt(usdcUnits)) {
        console.log("Meminta approve USDC...");
        const approveTx = await this.usdcContract.approve(this.shopAddress, ethers.constants.MaxUint256);
        await approveTx.wait();
        console.log("Approve USDC berhasil!");
      }

      // 3. Panggil buyItem di contract shop
      const tx = await this.shopContract.buyItem(itemId, { gasLimit: 150000 });
      console.log("Transaksi submit:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaksi sukses:", receipt);

      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error("Gagal melakukan transaksi Web3 USDC:", err);
      throw err;
    }
  }

  disconnect() {
    this.account = null;
    this.signer = null;
    this.shopContract = null;
    this.usdcContract = null;
    window.dispatchEvent(new CustomEvent('web3:disconnected'));
  }
}

export const web3Manager = new Web3Manager();
