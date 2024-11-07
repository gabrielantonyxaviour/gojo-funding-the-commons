import { ethers, Transaction } from "ethers";
import { DERIVATION_PATH } from "../constants";
import { Wallet } from "../services/near-wallet";
import { Ethereum } from "../services/ethereum";

export const sendNearMpcTx = async (
  address: string,
  baseTx: any,
  chainId: any,
  wallet: Wallet,
  chain: { rpcUrl: string; blockExplorer: string },
  provider: ethers.JsonRpcProvider
) => {
  const unsignedTx = ethers.getBytes(
    Transaction.from(baseTx).unsignedSerialized
  );
  sessionStorage.setItem("transaction", unsignedTx as any);

  const hashedTx = ethers.keccak256(unsignedTx);
  const payload = Object.values(ethers.getBytes(hashedTx));

  // Requesting signature with timeout handling
  const requestSignature = async () => {
    try {
      const { big_r, s, recovery_id } = await wallet.callMethod({
        contractId: "v1.signer-prod.testnet",
        method: "sign",
        args: {
          request: {
            payload,
            path: DERIVATION_PATH,
            key_version: 0,
          },
        },
        gas: "300000000000000",
        deposit: "1",
      });
      return { big_r, s, recovery_id };
    } catch (e: any) {
      console.log("MPC TX FAILED");
      console.log(e);
      throw e;
    }
  };

  const { big_r, s, recovery_id } = await requestSignature();

  const Eth = new Ethereum(chain.rpcUrl, chainId);

  const signedTransaction = await Eth.reconstructSignatureFromLocalSession(
    big_r,
    s,
    recovery_id,
    address
  );
  console.log("Signed Transaction");
  console.log(signedTransaction);
  const txHash = await Eth.relayTransaction(signedTransaction);
  console.log("Transaction hash");
  console.log(chain.blockExplorer + "/tx/" + txHash);
};
