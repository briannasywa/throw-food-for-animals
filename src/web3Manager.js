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

  isMobileDevice() {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Buka URL dApp langsung di dalam in-app browser MetaMask Mobile
   */
  openMetaMaskDeepLink() {
    // 1. Coba native Android Intent ke aplikasi MetaMask langsung
    const rawUrl = window.location.href;
    const cleanUrl = rawUrl.replace(/^https?:\/\//, '');

    // Coba buka aplikasi MetaMask terlebih dahulu jika di Android
    if (/Android/i.test(navigator.userAgent)) {
      // Skema intent atau dApp URL langsung
      window.location.href = `dapp://${cleanUrl}`;
      // Fallback intent
      setTimeout(() => {
        window.location.href = `https://metamask.app.link/dapp/${cleanUrl}`;
      }, 500);
    } else {
      window.location.href = `https://metamask.app.link/dapp/${cleanUrl}`;
    }
  }

  async connectWallet() {
    // Jika di perangkat mobile dan window.ethereum tidak ada (misal buka di Chrome Android standar)
    if (!this.isMetaMaskAvailable()) {
      if (this.isMobileDevice()) {
        // Tampilkan modal dialog panduan khusus mobile dengan tombol Copy Link & Buka App
        window.dispatchEvent(new CustomEvent('web3:showMobileModal', { detail: { url: window.location.href } }));
        return null;
      }

      alert("MetaMask / Web3 Wallet tidak ditemukan! Silakan instal ekstensi MetaMask.");
      return null;
    }

    try {
      this.isConnecting = true;
      // Gunakan provider dari window.ethereum (bisa MetaMask in-app browser atau extension)
      const ethereum = window.ethereum.providers 
        ? (window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum)
        : window.ethereum;

      this.provider = new ethers.providers.Web3Provider(ethereum, "any");

      const accounts = await this.provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("Akun tidak ditemukan");
      }

      this.account = accounts[0];
      this.signer = this.provider.getSigner();

      // Coba beralih ke jaringan Base Sepolia secara halus (tidak crash bila mobile wallet menolak switch otomatis)
      try {
        await this.switchToBaseSepolia();
      } catch (switchErr) {
        console.warn("Beralih network di mobile wallet dilewati/ditolak:", switchErr);
      }

      this.shopContract = new ethers.Contract(this.shopAddress, SHOP_ABI, this.signer);
      this.usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, this.signer);

      if (ethereum.on) {
        ethereum.on('accountsChanged', (accs) => {
          if (!accs || accs.length === 0) {
            this.disconnect();
          } else {
            this.account = accs[0];
            this.signer = this.provider.getSigner();
            this.shopContract = new ethers.Contract(this.shopAddress, SHOP_ABI, this.signer);
            this.usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, this.signer);
            window.dispatchEvent(new CustomEvent('web3:accountChanged', { detail: this.account }));
          }
        });

        ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }

      return this.account;
    } catch (err) {
      console.error("Gagal menghubungkan wallet:", err);
      // Di Android user cancel tidak perlu alert kasar
      if (err.code === 4001 || (err.message && err.message.includes('User rejected'))) {
        alert("Koneksi dibatalkan oleh pengguna.");
      } else {
        alert("Gagal menghubungkan wallet: " + (err.message || err));
      }
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
