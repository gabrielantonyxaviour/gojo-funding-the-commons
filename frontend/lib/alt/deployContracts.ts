import { getChainRpcAndExplorer } from "../utils";
import { Wallet } from "../services/near-wallet";
import { ethers } from "ethers";
import { sendNearMpcBatchTxns } from "./sendNearMpcBatchTxns";

export const deployContracts = async (
  sender: string,
  chainIds: number[],
  byteCodes: string[],
  wallet: Wallet
) => {
  console.log("deployContracts");
  const chains = chainIds.map((chainId) => getChainRpcAndExplorer(chainId));
  const providers = chains.map(
    (chain) => new ethers.JsonRpcProvider(chain.rpcUrl)
  );
  const transactions = providers.map(async (provider, i) => {
    const nonce = await provider.getTransactionCount(sender);
    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
    return {
      to: null,
      nonce,
      data: byteCodes[i],
      value: 0,
      gasLimit: 1_000_000, // 1m
      maxFeePerGas,
      maxPriorityFeePerGas,
      chainId: chainIds[i],
    };
  });

  await sendNearMpcBatchTxns(
    sender,
    transactions,
    chainIds,
    wallet,
    chains,
    providers
  );
};
