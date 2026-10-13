import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// RPC URL for read-only calls. Falls back to a list of public endpoints.
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const FALLBACK_RPC_URLS = [
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://sepolia.gateway.tenderly.co',
];

export const CONTRACT_ABI = [
  "function mintMyNFT(uint8 _charity, uint256 _goalAmount, string _influencerName, string _profileImageUrl) external",
  "function donate(uint256 tokenId) external payable",
  "function withdraw(uint256 tokenId) external",
  "function getCharityType(uint256 tokenId) external view returns (uint8)",
  "function getTotalDonations(uint256 tokenId) external view returns (uint256)",
  "function influencers(uint256) external view returns (uint8 charity, uint256 totalDonations, uint256 goalAmount, bool active, address creator, string influencerName, string profileImageUrl)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getTotalNFTs() external view returns (uint256)",
  "function getCampaignsByCreator(address creator) external view returns (uint256[])",
  "event NFTMinted(address indexed influencer, uint256 indexed tokenId, uint8 charity, uint256 goalAmount)",
  "event DonationReceived(uint256 indexed tokenId, address indexed donor, uint256 amount)",
  "event Withdrawn(uint256 indexed tokenId, address indexed influencer, uint256 amount)"
];

export const CHARITY_TYPES = {
  0: 'Housing',
  1: 'Meals',
  2: 'Medical',
  3: 'Education',
  4: 'Equipment',
  5: 'RiverCleaning'
};

export const getContract = (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

/**
 * Returns a JsonRpcProvider for read-only calls.
 * Tries NEXT_PUBLIC_RPC_URL first, then falls back through public endpoints.
 * Throws if none are reachable or if the contract bytecode is missing.
 */
export const getReadOnlyProvider = async () => {
  const urlsToTry = RPC_URL
    ? [RPC_URL, ...FALLBACK_RPC_URLS]
    : FALLBACK_RPC_URLS;

  let lastError;
  for (const url of urlsToTry) {
    try {
      const p = new ethers.JsonRpcProvider(url);
      // Lightweight liveness check
      await p.getBlockNumber();

      // Verify the contract is actually deployed at that address
      const code = await p.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error(
          `Contract not found at ${CONTRACT_ADDRESS} on this network. ` +
          'Check NEXT_PUBLIC_CONTRACT_ADDRESS and the RPC network.'
        );
      }

      return p;
    } catch (err) {
      lastError = err;
      console.warn(`RPC ${url} failed:`, err.message);
    }
  }

  throw lastError ?? new Error('Could not connect to any RPC provider');
};

export const formatEther = (value) => {
  return ethers.formatEther(value);
};

export const parseEther = (value) => {
  return ethers.parseEther(value);
};
