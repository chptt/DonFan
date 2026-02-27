# DonFan - Web3 Donation Platform

A fully responsive Web3 donation platform where influencers can receive donations from fans using MetaMask on the Sepolia Ethereum testnet.

## Features

- ERC721 NFT-based donation vaults for influencers
- 6 charity types with animated progress visualizations
- MetaMask integration with Sepolia testnet
- Fully responsive design (desktop & mobile)
- Real-time donation tracking on-chain
- Stage-based animations that unlock with donation milestones

## Tech Stack

- Next.js 14 (App Router)
- TailwindCSS
- Framer Motion
- Ethers.js v6
- Solidity ^0.8.20
- OpenZeppelin Contracts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

3. Deploy the smart contract to Sepolia:
```bash
# Use Hardhat, Remix, or your preferred tool
# Deploy contracts/InfluencerDonationNFT.sol
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Smart Contract

The `InfluencerDonationNFT` contract includes:
- One NFT per influencer wallet
- 6 charity types: Housing, Meals, Medical, Education, Equipment, RiverCleaning
- Donation tracking per NFT
- Withdrawal function for NFT owners
- ReentrancyGuard protection

## Charity Animations

Each charity has 5 stages that unlock based on donation progress:

- **Housing**: Land → Foundation → Walls → Roof → Windows/Door → Lights
- **Meals**: Empty Plate → Rice → Curry → Full Meal → Steam
- **Medical**: Base → Structure → Red Cross → Ambulance → Glow
- **Education**: Empty → Desks → Books/Board → Laptop → Lights
- **RiverCleaning**: Polluted → Cleaning → Cleaner → Fish → Trees/Birds → Clear Flow

## Mobile Support

- Responsive grid layouts
- Bottom-sheet style donation panel
- Large tap-friendly buttons (min 44px)
- Scalable SVG animations

## License

MIT
