// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract InfluencerDonationNFT is ERC721, ReentrancyGuard {
    enum CharityType { Housing, Meals, Medical, Education, Equipment, RiverCleaning }
    
    struct InfluencerData {
        CharityType charity;
        uint256 totalDonations;
        uint256 goalAmount;
        bool active;
        address creator;
    }
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => InfluencerData) public influencers;
    
    event NFTMinted(address indexed influencer, uint256 indexed tokenId, CharityType charity, uint256 goalAmount);
    event DonationReceived(uint256 indexed tokenId, address indexed donor, uint256 amount);
    event Withdrawn(uint256 indexed tokenId, address indexed influencer, uint256 amount);
    
    constructor() ERC721("InfluencerDonationNFT", "IDNFT") {}
    
    function mintMyNFT(CharityType _charity, uint256 _goalAmount) external {
        require(_goalAmount > 0, "Goal must be greater than 0");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        influencers[tokenId] = InfluencerData({
            charity: _charity,
            totalDonations: 0,
            goalAmount: _goalAmount,
            active: true,
            creator: msg.sender
        });
        
        emit NFTMinted(msg.sender, tokenId, _charity, _goalAmount);
    }
    
    function donate(uint256 tokenId) external payable nonReentrant {
        require(_exists(tokenId), "NFT does not exist");
        require(msg.value > 0, "Donation must be greater than 0");
        require(influencers[tokenId].active, "Campaign not active");
        
        influencers[tokenId].totalDonations += msg.value;
        
        emit DonationReceived(tokenId, msg.sender, msg.value);
    }
    
    function withdraw(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(influencers[tokenId].totalDonations > 0, "No funds to withdraw");
        
        uint256 amount = influencers[tokenId].totalDonations;
        influencers[tokenId].totalDonations = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(tokenId, msg.sender, amount);
    }
    
    function getCharityType(uint256 tokenId) external view returns (CharityType) {
        require(_exists(tokenId), "NFT does not exist");
        return influencers[tokenId].charity;
    }
    
    function getTotalDonations(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "NFT does not exist");
        return influencers[tokenId].totalDonations;
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _tokenIdCounter;
    }
    
    function getTotalNFTs() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Get all campaigns created by a specific address
    function getCampaignsByCreator(address creator) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First, count how many campaigns this creator has
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (influencers[i].creator == creator) {
                count++;
            }
        }
        
        // Create array and populate it
        uint256[] memory campaigns = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (influencers[i].creator == creator) {
                campaigns[index] = i;
                index++;
            }
        }
        
        return campaigns;
    }
}
