import { ethers, Transaction } from "ethers";
import { DERIVATION_PATH } from "../constants";
import { Wallet } from "../services/near-wallet";
import { Ethereum } from "../services/ethereum";

export const sendNearMpcBatchTxns = async (
  address: string,
  transactions: any[],
  chainIds: number[],
  wallet: Wallet,
  chains: { rpcUrl: string; blockExplorer: string }[],
  providers: ethers.JsonRpcProvider[]
) => {
  const payloads = transactions.map((tx, i) => {
    const unsignedTx = ethers.getBytes(Transaction.from(tx).unsignedSerialized);
    sessionStorage.setItem("transaction-" + chains[i], unsignedTx as any);
    const hashedTx = ethers.keccak256(unsignedTx);
    return Object.values(ethers.getBytes(hashedTx));
  });
  const requestSignature = async () => {
    try {
      const receivedResponse = await wallet.callBatchMethods({
        contractId: "v1.signer-prod.testnet",
        method: "sign",
        args: payloads.map((payload) => {
          return {
            request: {
              payload,
              path: DERIVATION_PATH,
              key_version: 0,
            },
          };
        }),
        gas: (BigInt("300000000000000") / BigInt(payloads.length)).toString(),
        deposit: "1",
      });
      return receivedResponse;
      // return { big_r, s, recovery_id };
    } catch (e: any) {
      console.log("MPC TX FAILED");
      console.log(e);
      throw e;
    }
  };
  const receivedResponse = await requestSignature();
  console.log("Received Response");
  console.log(receivedResponse);
};
