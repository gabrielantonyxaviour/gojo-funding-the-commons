import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

const connectToLit = async () => {
  try {
    const litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });

    await litNodeClient.connect();
    console.log("Connected to Lit Network");
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
};

connectToLit();
