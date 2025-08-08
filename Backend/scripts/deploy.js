const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting ProofOfHeist deployment...");
  
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  
  const BASE_METADATA_URI = "ipfs://bafybeig7llcwaq4lqxrystx7jdi6xovisp6ni4nq3skkcttbnuzckia7ki";
  const TOTAL_METADATA_COUNT = 16; 
  
  console.log("📋 Constructor params:");
  console.log("   Base URI:", BASE_METADATA_URI);
  console.log("   NFT Count:", TOTAL_METADATA_COUNT);
  
  
  console.log("⏳ Deploying ProofOfHeist contract...");
  const ProofOfHeist = await ethers.getContractFactory("ProofOfHeist");
  
  const contract = await ProofOfHeist.deploy(
    BASE_METADATA_URI,
    TOTAL_METADATA_COUNT
  );
  
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ ProofOfHeist deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Block explorer:", `https://sepolia.basescan.org/address/${contractAddress}`);
  
  
  console.log("\n📊 Contract Configuration:");
  console.log("   Entry Fee:", ethers.formatEther(await contract.ENTRY_FEE()), "ETH");
  console.log("   Passing Score:", await contract.PASSING_SCORE(), "/ 16");
  console.log("   Cooldown:", await contract.COOLDOWN_PERIOD() / 60, "minutes");
  console.log("   Success Refund:", await contract.SUCCESS_REFUND_PERCENTAGE(), "%");
  
  
  const deploymentInfo = {
    network: "baseSepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    baseMetadataURI: BASE_METADATA_URI,
    totalMetadataCount: TOTAL_METADATA_COUNT
  };
  
  console.log("\n💾 Deployment complete!");
  console.log("📋 Save this info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });