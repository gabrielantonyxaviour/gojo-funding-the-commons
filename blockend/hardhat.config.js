require("@nomicfoundation/hardhat-toolbox");
require("hardhat-dependency-compiler");
require("hardhat-contract-sizer");
require("./tasks");
const { networks } = require("./networks");

const REPORT_GAS =
  process.env.REPORT_GAS?.toLowerCase() === "true" ? true : false;

const SOLC_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1_000,
  },
};
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.26",
        settings: SOLC_SETTINGS,
      },
    ],
  },

  networks: {
    ...networks,
  },
  etherscan: {
    apiKey: {
      baseSepolia: networks.baseSepolia.verifyApiKey,
      storyTestnet: networks.storyTestnet.verifyApiKey,
      skaleTestnet: networks.skaleTestnet.verifyApiKey,
      polygonAmoy: networks.polygonAmoy.verifyApiKey,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: networks.baseSepolia.chainId,
        urls: {
          apiURL: networks.baseSepolia.verifyApiUrl,
          browserURL: networks.baseSepolia.blockExplorer,
        },
      },
      {
        network: "storyTestnet",
        chainId: networks.storyTestnet.chainId,
        urls: {
          apiURL: networks.storyTestnet.verifyApiUrl,
          browserURL: networks.storyTestnet.blockExplorer,
        },
      },
      {
        network: "skaleTestnet",
        chainId: networks.skaleTestnet.chainId,
        urls: {
          apiURL: networks.skaleTestnet.verifyApiUrl,
          browserURL: networks.skaleTestnet.blockExplorer,
        },
      },
      {
        network: "polygonAmoy",
        chainId: networks.polygonAmoy.chainId,
        urls: {
          apiURL: networks.polygonAmoy.verifyApiUrl,
          browserURL: networks.polygonAmoy.blockExplorer,
        },
      },
    ],
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts",
  },
  mocha: {
    timeout: 200000,
  },
};
