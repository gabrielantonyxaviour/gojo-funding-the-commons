import ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import dotnev from "dotenv";

dotnev.config();

async function main() {
  const ethersSigner = new ethers.Wallet(
    process.env.ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilTest,
    debug: false,
  });
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersSigner,
      capacityTokenId: "25154",
      delegateeAddresses: [ethersSigner.address],
      uses: "1",
      expiration: new Date(Date.now() + 1000 * 60 * 500).toISOString(), // 10 minutes
    });
  console.log("Successfully created capacity delegation auth sig");
  return capacityDelegationAuthSig;
}

main()
  .then((res) => {
    console.log(res);
    return 0;
  })
  .catch((err) => {
    if (err) {
      console.log("Error: ", err.message);
      return 1;
    }
  });
