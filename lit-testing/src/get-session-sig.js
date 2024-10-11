import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessage,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";

import dotnev from "dotenv";

dotnev.config();

const ETHEREUM_PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY;

async function main() {
  let litNodeClient;
  const capacityTokenId = "25154";

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    if (!capacityTokenId) {
      console.log("🔄 Minting Capacity Credits NFT...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [ethersSigner.address],
        uses: "1",
      });
    console.log(`✅ Created the capacityDelegationAuthSig`);

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    const sessionSignatures = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 500).toISOString(), // 10 minutes
      capabilityAuthSigs: [capacityDelegationAuthSig],
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionSigning,
        },
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Sigs via an Auth Sig");
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
}

main()
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    if (err) {
      console.log("Error: ", err.message);
    }
  });
