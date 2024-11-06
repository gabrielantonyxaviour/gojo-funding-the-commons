import { ethers } from "ethers";
import { chains, DERIVATION_PATH, idToChain } from "../constants";
import { Wallet } from "../services/near-wallet";
import { Chain } from "viem";
import BN from "bn.js";
import * as nearAPI from "near-api-js";

const { Account } = nearAPI;
const getTxTimeout = 20000; // Set timeout as 20 seconds
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const sendNearMpcTx = async (
  address: string,
  baseTx: any,
  chainId: any,
  wallet: Wallet,
  chain: { rpcUrl: string; blockExplorer: string },
  provider: ethers.providers.JsonRpcProvider
) => {
  const unsignedTx = ethers.utils.serializeTransaction(baseTx);
  sessionStorage.setItem("transaction", unsignedTx);
  const hashedTx = ethers.utils.keccak256(unsignedTx);
  const payload = Object.values(ethers.utils.arrayify(hashedTx));
  let attachedDeposit = "1";

  let args = {
    payload,
    path: DERIVATION_PATH,
    key_version: 0,
    rlp_payload: undefined,
    request: undefined,
  };

  // Requesting signature with timeout handling
  const requestSignature = async () => {
    try {
      const { big_r, s, recovery_id } = await wallet.callMethod({
        contractId: "v1.signer-dev.testnet",
        method: "sign",
        args: { request: args },
        gas: "300000000000000",
        deposit: attachedDeposit,
      });
      return { big_r, s, recovery_id };
    } catch (e: any) {
      console.log("FAILED");
      console.log(e);
      if (e.context?.transactionHash) {
        console.log(`Transaction timeout. Waiting 20s to retry...`);
        await sleep(getTxTimeout);
        const transaction = await wallet.getTransactionResult(
          e.context.transactionHash
        );
        return transaction.status.SuccessValue
          ? JSON.parse(
              Buffer.from(transaction.status.SuccessValue, "base64").toString(
                "ascii"
              )
            )
          : null;
      }
      throw e;
    }
  };

  const { big_r, s, recovery_id } = await requestSignature();

  const sig = {
    r: big_r.affine_point.slice(2),
    s: s.scalar,
    v: 0,
  };

  console.log("address", address);
  let addressRecovered = false;
  for (let v = 0; v < 2; v++) {
    sig.v = v + chainId * 2 + 35;
    const recoveredAddress = ethers.utils.recoverAddress(payload, sig);

    console.log("recoveredAddress", recoveredAddress);
    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      addressRecovered = true;
      break;
    }
  }

  try {
    const hash = await provider.send("eth_sendRawTransaction", [
      ethers.utils.serializeTransaction(baseTx, sig),
    ]);
    console.log("tx hash", hash);
    console.log("explorer link", `${chain.blockExplorer}/tx/${hash}`);
  } catch (e) {
    if (/nonce too low/gi.test(JSON.stringify(e))) {
      return console.log("tx has been tried");
    }
    if (/gas too low|underpriced/gi.test(JSON.stringify(e))) {
      return console.log(e);
    }
    console.log(e);
  }
};
