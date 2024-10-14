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
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "IP",
    blockExplorer: "https://testnet.storyscan.xyz/",
    verifyApiUrl: "https://testnet.storyscan.xyz/api",
    ipRegistry: "0x1a9d0d28a0422F26D31Be72Edc6f13ea4371E11B",
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
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    blockExplorer: "https://sepolia.basescan.org/",
    verifyApiUrl: "https://api-sepolia.basescan.org/api",
  },
};

module.exports = {
  networks,
};
