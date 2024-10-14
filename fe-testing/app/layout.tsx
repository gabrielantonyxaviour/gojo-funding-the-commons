import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { EnvironmentStoreProvider } from "@/components/context";
import { ReactFlowProvider } from "@xyflow/react";
// import OnchainProviders from "@/components/providers/onchain-providers";
export const metadata: Metadata = {
  title: "Gojo",
  description:
    "Gojo is a NO code solution for any user to create a web3 prototype in less than 10 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EnvironmentStoreProvider>
          {/* <OnchainProviders> */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactFlowProvider>
              <Toaster />
              {children}
            </ReactFlowProvider>
          </ThemeProvider>
          {/* </OnchainProviders> */}
        </EnvironmentStoreProvider>
      </body>
    </html>
  );
}
