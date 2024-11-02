import Image from "next/image";
import Title from "./title";
import { SearchBar } from "./search-bar";
import { relayTransaction, createAccount } from "@near-relay/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import ConnectButton from "../ui/custom/connect-button";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Client,
  useClient,
  useConversations,
  useStartConversation,
} from "@xmtp/react-sdk";
// import { ethers } from "ethers";
import ConnectXmtpButton from "../ui/custom/connect-xmtp-button";
import { useEnvironmentStore } from "../context";
import { IconArrowUpRight, IconLogout } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "../ui/toast";
import { Action, actionCreators } from "@near-js/transactions";

export default function Home() {
  const { toast } = useToast();
  const [createTx, setCreateTx] = useState("");
  // const { login, authenticated, logout } = usePrivy();
  // const { wallets } = useWallets();
  // const [isOnNetwork, setIsOnNetwork] = useState(false);
  // const [ethersSigner, setEthersSigner] = useState<ethers.Signer | null>(null);
  // const { client, error, isLoading, initialize, disconnect } = useClient();
  // const [xmtpLoading, setXmtpLoading] = useState(false);
  const { wallet, signedAccountId } = useEnvironmentStore((store) => store);
  // const { conversations } = useConversations();

  // useEffect(() => {
  //   if (authenticated && isOnNetwork) {
  //     const filtered = conversations.filter(
  //       (conversation) =>
  //         conversation.peerAddress === CORE_AI_AGENT_XMTP_ADDRESS
  //     );
  //     if (filtered.length > 0) {
  //       setConversation(filtered[0]);
  //     }
  //   }
  // }, [authenticated, isOnNetwork, client]);
  // useEffect(() => {
  //   const initialIsOnNetwork =
  //     localStorage.getItem("isOnNetwork") === "true" || false;

  //   setIsOnNetwork(initialIsOnNetwork);
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("isOnNetwork", isOnNetwork.toString());
  //   localStorage.setItem("isConnected", authenticated.toString());
  // }, [authenticated, isOnNetwork]);

  // useEffect(() => {
  //   if (authenticated && ethersSigner == null) {
  //     console.log("SET SIGNER", isOnNetwork);
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     setEthersSigner(signer);
  //   }
  //   if (client && !isOnNetwork) {
  //     setIsOnNetwork(true);
  //     console.log("isOnNetwork", isOnNetwork);
  //   }
  //   if (isOnNetwork && ethersSigner) {
  //     initXmtpWithKeys(ethersSigner);
  //   }
  // }, [authenticated, client, ethersSigner]);

  // const initXmtpWithKeys = async (signer: ethers.Signer) => {
  //   const options: { env: "dev" | "local" | "production" | undefined } = {
  //     env: "production",
  //   };
  //   const address = wallets[0]?.address;
  //   if (!address) return;
  //   let keys: any = loadKeys(address);
  //   if (!keys) {
  //     keys = await Client.getKeys(signer, {
  //       ...options,
  //       skipContactPublishing: true,
  //       persistConversations: false,
  //     });
  //     storeKeys(address, keys);
  //   }
  //   setXmtpLoading(true);
  //   await initialize({ keys, options, signer });
  // };

  // const storeKeys = (walletAddress: string, keys: any) => {
  //   localStorage.setItem(
  //     buildLocalStorageKey(walletAddress),
  //     Buffer.from(keys).toString("binary")
  //   );
  // };

  // const loadKeys = (walletAddress: string) => {
  //   const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  //   return val ? Buffer.from(val, "binary") : null;
  // };

  // const buildLocalStorageKey = (walletAddress: string) => {
  //   return walletAddress ? `xmtp:production:keys:${walletAddress}` : "";
  // };

  // const handleLogout = async () => {
  //   await logout();
  //   const address = wallets[0]?.address;
  //   wipeKeys(address);
  //   console.log("wipe", address);
  //   setEthersSigner(null);
  //   setIsOnNetwork(false);
  //   await disconnect();
  //   // setSelectedConversation(null);
  //   localStorage.removeItem("isOnNetwork");
  //   localStorage.removeItem("isConnected");
  // };
  // const wipeKeys = (walletAddress: string) => {
  //   localStorage.removeItem(buildLocalStorageKey(walletAddress));
  // };
  const signIn = () => {
    wallet.signIn();
  };

  return (
    <div className="flex flex-col justify-center items-center h-full space-y-4">
      <Image
        src="/logo-nouns.png"
        alt="logo"
        width={80}
        height={80}
        className="rounded-full opacity-90"
      />
      <Title />
      {signedAccountId ? (
        <>
          <SearchBar conversation={null} />
          {/* <Button
            onClick={async () => {
              console.log("create account");
              const receipt = await createAccount(
                "/api/relayer/create-account",
                "kfjndsjkvndslkvnmdslkvmdslkmvdslvkmnsl.testnet",
                {
                  password: "lfg",
                }
              );
              console.log(receipt);
              // setCreateReceipt(JSON.stringify(receipt.transaction));
              setCreateTx(receipt.transaction.hash);
              toast({
                title: "Transaction Success",
                description: "Created NEAR Account",
                action: (
                  <ToastAction
                    onClick={() => {
                      console.log(JSON.stringify(receipt.transaction));
                      window.open(
                        "https://testnet.nearblocks.io/txns/" +
                          receipt.transaction.hash,
                        "_blank"
                      );
                    }}
                    altText="View Transaction"
                  >
                    View Tx <IconArrowUpRight size={16} />
                  </ToastAction>
                ),
              });
            }}
          >
            Create NEAR Account
          </Button> */}
        </>
      ) : (
        <ConnectButton login={signIn} />
      )}
      {/* {!authenticated ? (
        <ConnectButton login={login} />
      ) : !isOnNetwork ? (
        <ConnectXmtpButton
          disabled={!ethersSigner || isLoading}
          login={() => {
            initXmtpWithKeys(ethersSigner!);
          }}
        />
      ) : (
        <>
          <SearchBar conversation={conversation} />
          <Button
            className="cursor-pointer flex space-x-2"
            variant={"outline"}
            onClick={() => {
              console.log("logout");
              handleLogout();
            }}
          >
            <IconLogout />
            <p>Logout XMTP</p>
          </Button>
        </>
      )} */}
    </div>
  );
}
