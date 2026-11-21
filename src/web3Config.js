/**
 * Web3 Configuration for Base Sepolia Testnet
 * Chain ID: 84532 (0x14a34)
 */

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_CHAIN_ID_HEX = '0x14a34';

export const BASE_SEPOLIA_CONFIG = {
  chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Base Sepolia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// Default deployed contract or fallback address
// Can be updated with your deployed contract address on Base Sepolia
export const SHOP_CONTRACT_ADDRESS = '0xa87E23938fe797495B4Eb6475752e5055b871c56';

export const SHOP_ABI = [
  "function buyItem(uint256 itemId) external payable",
  "function items(uint256) external view returns (string name, uint256 priceWei, uint256 quantity, bool active)",
  "function getPlayerInventory(address player) external view returns (uint256 powerBuff, uint256 legendaryBaits)",
  "function playerPowerBuffs(address) external view returns (uint256)",
  "function playerLegendaryBaits(address) external view returns (uint256)",
  "event ItemPurchased(address indexed buyer, uint256 indexed itemId, string itemName, uint256 amountPaid, uint256 timestamp)"
];
