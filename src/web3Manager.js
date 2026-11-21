import { ethers } from 'ethers';
import { BASE_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID_HEX, BASE_SEPOLIA_CONFIG, SHOP_CONTRACT_ADDRESS, SHOP_ABI } from './web3Config.js';

class Web3Manager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.isConnecting = false;
    this.contractAddress = SHOP_CONTRACT_ADDRESS;

    // Load persisted address if stored
    const saved = localStorage.getItem('zootoss_contract_addr');
    if (saved) this.contractAddress = saved;
  }

  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  }

  setContractAddress(addr) {
    if (ethers.utils.isAddress(addr)) {
      this.contractAddress = addr;
      localStorage.setItem('zootoss_contract_addr', addr);
      if (this.signer) {
        this.contract = new ethers.Contract(this.contractAddress, SHOP_ABI, this.signer);
      }
      return true;
    }
    return false;
  }

  async connectWallet() {
    if (!this.isMetaMaskAvailable()) {
      alert("MetaMask / Web3 Wallet not detected! Please install MetaMask extension to purchase on-chain items.");
      return null;
    }

    try {
      this.isConnecting = true;
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");

      // Request account access
      const accounts = await this.provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.account = accounts[0];
      this.signer = this.provider.getSigner();

      // Check and switch network to Base Sepolia
      await this.switchToBaseSepolia();

      this.contract = new ethers.Contract(this.contractAddress, SHOP_ABI, this.signer);

      // Listen to account changes
      window.ethereum.on('accountsChanged', (accs) => {
        if (accs.length === 0) {
          this.disconnect();
        } else {
          this.account = accs[0];
          this.signer = this.provider.getSigner();
          this.contract = new ethers.Contract(this.contractAddress, SHOP_ABI, this.signer);
          window.dispatchEvent(new CustomEvent('web3:accountChanged', { detail: this.account }));
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return this.account;
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      alert("Failed to connect wallet: " + (err.message || err));
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
      // 4902 means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_CONFIG],
          });
        } catch (addError) {
          console.error("Error adding Base Sepolia network:", addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  async buyShopItem(itemId, priceEthString) {
    if (!this.account) {
      const connected = await this.connectWallet();
      if (!connected) return false;
    }

    try {
      await this.switchToBaseSepolia();
      const priceWei = ethers.utils.parseEther(priceEthString);

      // Execute on-chain transaction
      const tx = await this.contract.buyItem(itemId, {
        value: priceWei,
        gasLimit: 120000
      });

      console.log("Transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);
      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error("On-chain purchase error:", err);
      throw err;
    }
  }

  disconnect() {
    this.account = null;
    this.signer = null;
    this.contract = null;
    window.dispatchEvent(new CustomEvent('web3:disconnected'));
  }
}

export const web3Manager = new Web3Manager();
