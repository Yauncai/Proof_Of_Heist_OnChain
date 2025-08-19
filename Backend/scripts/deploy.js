const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting ProofOfHeist deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Updated configuration for final contract
  const BASE_URI = "ipfs://bafybeiany6eepwah6ouphjp46ljpb2yrwsmaevkb3h5sjtdijf5nem5rmq/"; 
  const ENTRY_FEE = ethers.parseEther("0.01"); // 0.01 ETH
  
  console.log("📋 Constructor params:");
  console.log("   Base URI:", BASE_URI);
  console.log("   Entry Fee:", ethers.formatEther(ENTRY_FEE), "ETH");
  
  console.log("⏳ Deploying ProofOfHeist contract...");
  const ProofOfHeist = await ethers.getContractFactory("ProofOfHeist");
  
  const contract = await ProofOfHeist.deploy(
    BASE_URI
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ ProofOfHeist deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Block explorer:", `https://sepolia.basescan.org/address/${contractAddress}`);
  
  console.log("\n📊 Contract Configuration:");
  console.log("   Entry Fee:", ethers.formatEther(await contract.ENTRY_FEE()), "ETH");
  console.log("   Passing Score:", await contract.PASSING_SCORE(), "/ 16");
  
  // Verify deployment matches final contract
  console.log("\n🔍 Verification Checks:");
  console.log("   NFT Implementation:", await contract.supportsInterface("0x80ac58cd") ? "ERC721 ✔" : "Invalid ❌");
  console.log("   Owner:", await contract.owner() === deployer.address ? "Match ✔" : "Mismatch ❌");
  
  const deploymentInfo = {
    network: "baseSepolia",
    contract: "ProofOfHeist",
    version: "1.0",
    address: contractAddress,
    deployer: deployer.address,
    deploymentTx: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    config: {
      baseURI: BASE_URI,
      entryFee: ethers.formatEther(ENTRY_FEE),
      passingScore: 14
    }
  };
  
  console.log("\n💾 Deployment complete!");
  console.log("📋 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Recommended next steps
  console.log("\n🔜 Recommended next steps:");
  console.log("1. Store this deployment info securely");
  console.log("2. Verify contract on Basescan");
  console.log(`   Run: npx hardhat verify --network baseSepolia ${contractAddress} "${BASE_URI}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });