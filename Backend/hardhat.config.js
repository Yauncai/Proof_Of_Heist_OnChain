require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, ETHERSCAN_API_KEY, ALCHEMY_BASE_SEPOLIA} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  }, etherscan: {
    apiKey: {
      baseSepolia: process.env.ETHERSCAN_API_KEY,
    },
    },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    baseSepolia: {
      url: process.env.ALCHEMY_BASE_SEPOLIA, 
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      gasPrice: 1000000000, 
    },
  },
};
