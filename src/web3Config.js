/**
 * Web3 Configuration for Base Sepolia Testnet (USDC Edition)
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

// Official Circle USDC Contract on Base Sepolia
export const USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Deployed ZooTossShop Contract on Base Sepolia (Valid Checksum)
export const SHOP_CONTRACT_ADDRESS = '0x4f8bE5164D2Fe26a9Bf71d53f66d467d3e236f6D';

// Standard ERC20 ABI (for USDC approval & balance)
export const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)"
];

// ZooTossShop ABI
export const SHOP_ABI = [
  "function buyItem(uint256 itemId) external",
  "function items(uint256) external view returns (string name, uint256 priceUsdc, uint256 quantity, bool active)",
  "function getPlayerInventory(address player) external view returns (uint256 powerBuff, uint256 legendaryBaits)",
  "function playerPowerBuffs(address) external view returns (uint256)",
  "function playerLegendaryBaits(address) external view returns (uint256)",
  "function usdc() external view returns (address)",
  "event ItemPurchased(address indexed buyer, uint256 indexed itemId, string itemName, uint256 usdcPaid, uint256 timestamp)"
];
