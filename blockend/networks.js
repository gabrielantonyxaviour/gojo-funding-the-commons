require("@chainlink/env-enc").config();

const DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS = 3;

const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;

const accounts = [];
if (PRIVATE_KEY) {
  accounts.push(PRIVATE_KEY);
}
const networks = {
  storyTestnet: {
    url: "https://testnet.storyrpc.io/",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: "RANDOM",
    chainId: 1513,
    eid: 40315,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "IP",
    blockExplorer: "https://testnet.storyscan.xyz/",
    verifyApiUrl: "https://testnet.storyscan.xyz/api",
    ipRegistry: "0x1a9d0d28a0422F26D31Be72Edc6f13ea4371E11B",
    endpoint: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
    layerZeroTesting: "0x08AC2b69feB202b34aD7c65E5Ac876E901CA6216",
  },
  baseSepolia: {
    url:
      "https://api.developer.coinbase.com/rpc/v1/base-sepolia/" +
      process.env.COINBASE_RPC_KEY,
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.BASESCAN_API_KEY || "UNSET",
    chainId: 84532,
    eid: 40245,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    blockExplorer: "https://sepolia.basescan.org/",
    verifyApiUrl: "https://api-sepolia.basescan.org/api",
    endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    layerZeroTesting: "0x10529ceb5C5Ca607f6438B8A5277c96fbaAfA730",
  },
  polygonAmoy: {
    url: "https://polygon-amoy-bor-rpc.publicnode.com",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.POLYGONSCAN_API_KEY || "UNSET",
    chainId: 80002,
    eid: 40267,
    confirmations: 5,
    nativeCurrencySymbol: "POL",
    blockExplorer: "https://amoy.polygonscan.com/",
    verifyApiUrl: "https://api-amoy.polygonscan.com/api",
    endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    layerZeroTesting: "0x9Fa2f0872498f56Fec437d92D66842f162c6B922",
  },
  skaleTestnet: {
    url: "https://testnet.skalenodes.com/v1/juicy-low-small-testnet",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: "RANDOM",
    chainId: 1444673419,
    eid: 40273,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "sFUEL",
    blockExplorer:
      "https://juicy-low-small-testnet.explorer.testnet.skalenodes.com/",
    verifyApiUrl:
      "https://juicy-low-small-testnet.explorer.testnet.skalenodes.com/api",
    endpoint: "0x82b7dc04A4ABCF2b4aE570F317dcab49f5a10f24",
    layerZeroTesting: "0x4ab8f50796b059aE5C8b8534afC6bb4c84912ff6",
  },
};

module.exports = {
  networks,
};
