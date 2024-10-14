import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

const apiKeyName = "organizations/xxx/apiKeys/xxx";
const apiKeyPrivateKey = "xxx";
const coinbase = new Coinbase(apiKeyName, apiKeyPrivateKey);
// Create a Wallet for the User.
let wallet = await Wallet.create();
console.log(`Wallet successfully created: `, wallet.toString());

// Wallets come with a single default Address, accessible via getDefaultAddress:
let address = await wallet.getDefaultAddress();
console.log(`Default address for the wallet: `, address.toString());

// const faucetTransaction = await wallet.faucet();
// console.log(
//   `Faucet transaction successfully completed: `,
//   faucetTransaction.toString()
// );

// let anotherWallet = await Wallet.create();
// console.log(`Second Wallet successfully created: `, anotherWallet.toString());

// const transfer = await wallet.createTransfer({
//   amount: 0.00001,
//   assetId: Coinbase.assets.Eth,
//   destination: anotherWallet,
// });

// // Wait for the transfer to complete or fail on-chain.
// await transfer.wait();

// console.log(`Transfer successfully completed: `, transfer.toString());
