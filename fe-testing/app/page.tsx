"use client";

import { Button } from "@/components/ui/button";
import WalletWrapper from "@/components/wallet-wrapper";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";
export default function HomePage() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center  bg-black">
      <p>Hekllo</p>
      <Button onClick={() => {}}>Testing</Button>
    </div>
  );
}
