const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting ProofOfHeist deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deployment parameters
  const BASE_URI = "ipfs://bafybeiany6eepwah6ouphjp46ljpb2yrwsmaevkb3h5sjtdijf5nem5rmq/";
  const ENTRY_FEE = ethers.parseEther("0.00001"); 

  console.log("📋 Constructor params:");
  console.log("   Base URI:", BASE_URI);
  console.log("   Entry Fee:", ethers.formatEther(ENTRY_FEE), "ETH");

  console.log("⏳ Deploying ProofOfHeist contract...");
  const ProofOfHeist = await ethers.getContractFactory("ProofOfHeist");

  
  const contract = await ProofOfHeist.deploy(BASE_URI);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ ProofOfHeist deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
