import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { EnvironmentStoreProvider } from "@/components/context";
import { Navigation } from "@/components/ui/custom/navigation";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <WalletProvider> */}
          <EnvironmentStoreProvider>
            <Toaster />
            <div className="h-screen w-screen">
              {children}
              <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="flex justify-center">
                  <Navigation />
                </div>
              </div>
            </div>
          </EnvironmentStoreProvider>
          {/* </WalletProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
