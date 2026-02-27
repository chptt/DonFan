const hre = require("hardhat");

async function main() {
  console.log("Deploying InfluencerDonationNFT contract...");

  // Get the contract factory
  const InfluencerDonationNFT = await hre.ethers.getContractFactory("InfluencerDonationNFT");
  
  // Deploy the contract
  const contract = await InfluencerDonationNFT.deploy();
  
  // Wait for deployment to finish
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("3. Restart your dev server: npm run dev");
  console.log("\n🔍 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
