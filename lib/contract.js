import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

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

export const formatEther = (value) => {
  return ethers.formatEther(value);
};

export const parseEther = (value) => {
  return ethers.parseEther(value);
};
