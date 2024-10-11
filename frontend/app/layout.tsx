import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { EnvironmentStoreProvider } from "@/components/context";
import Layout from "@/components/layout";
import { ReactFlowProvider } from "@xyflow/react";
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
    <EnvironmentStoreProvider>
      <html lang="en">
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactFlowProvider>
              <Toaster />
              <Layout>{children}</Layout>
            </ReactFlowProvider>
          </ThemeProvider>
        </body>
      </html>
    </EnvironmentStoreProvider>
  );
}
