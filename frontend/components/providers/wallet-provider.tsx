"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import * as React from "react";
import { polygonAmoy, skaleEuropaTestnet, storyTestnet } from "viem/chains";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { theme } = useTheme();
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: theme == "light" ? "light" : "dark",
          accentColor: "#ffffff",
          logo: "https://gojo-ethglobal.vercel.app/logo-nouns.png",
        },
        defaultChain: skaleEuropaTestnet,
        supportedChains: [skaleEuropaTestnet, storyTestnet, polygonAmoy],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
