"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { IconArrowUp, IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { useCallback, useState } from "react";
import Suggestions from "./suggestions";
import {
  setConversationUpdatedAt,
  useSendMessage,
  useStartConversation,
} from "@xmtp/react-sdk";
import { useRouter } from "next/navigation";
import { useEnvironmentStore } from "../context";
import { createWalletClient, custom, zeroAddress } from "viem";
import { skaleEuropaTestnet } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";
import { timestamp } from "rxjs";
import { uploadToWalrus } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GOJO_CONTRACT, THIRTY_GAS } from "@/lib/constants";
import { ToastAction } from "../ui/toast";
import Image from "next/image";

export function SearchBar({ conversation }: { conversation: any }) {
  const {
    prompt,
    setPrompt,
    addChat,
    addProject,
    projects,
    setCreateProjectInitNodes,
  } = useEnvironmentStore((store) => store);
  const { wallet, userAccount } = useEnvironmentStore((store) => store);
  const [walrusBlobId, setWalrusBlobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  // const { startConversation } = useStartConversation();
  // const { sendMessage } = useSendMessage();
  // const { wallets } = useWallets();
  // const [cachedConversation, setCachedConversation] = useState<any>(null);
  // const handleSendNewMessage = useCallback(
  //   async (message: string) => {
  //     if (!message.trim()) {
  //       alert("Empty message");
  //       return;
  //     }

  //     const newConversation = await startConversation(
  //       CORE_AI_AGENT_XMTP_ADDRESS,
  //       message
  //     );
  //     setCachedConversation(newConversation?.cachedConversation);
  //   },
  //   [startConversation, setCachedConversation, CORE_AI_AGENT_XMTP_ADDRESS]
  // );
  return (
    <div className="xl:w-[1000px] lg:w-[800px] w-[600px]">
      <Card>
        <CardContent className="p-0 relative">
          {loading && (
            <div className="absolute w-full flex justify-center items-center rounded-lg">
              <Image src="/loading.gif" width={95} height={95} alt="loading" />
              <p className="text-center text-sm pt-6 text-muted-foreground">
                {status}
              </p>
            </div>
          )}
          <Input
            disabled={loading}
            value={loading ? "" : prompt}
            onChange={(e) => [setPrompt(e.target.value)]}
            placeholder={
              loading ? "" : "Ask a question or search for answers..."
            }
            className="2xl:text-lg text-md font-medium p-4 bg-transparent border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
          />
          <div className="flex justify-end ">
            <Button
              variant={"secondary"}
              className="px-3 py-4 m-2"
              disabled={loading}
              onClick={async () => {
                if (!userAccount) return;
                setLoading(true);
                setStatus("Generating Smart Contracts");

                toast({
                  title: "Create Project (1/4)",
                  description: "Generating Smart contracts. Please wait...",
                });
                let aiResponse;
                try {
                  const res = await fetch("http://127.0.0.1:8000/chat", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      message: prompt,
                      contracts: [],
                      selectedContract: null,
                      selectedConnection: null,
                      name: "",
                    }),
                  });
                  console.log("AI REsponse");
                  aiResponse = await res.json();
                } catch (err) {
                  console.log(err);
                  toast({
                    title: "Create Project Failed",
                    description:
                      "Something is wrong with the AI. If issue persists, contact @gabrielaxyy at tg.",
                    variant: "destructive",
                  });
                  return;
                }

                setStatus("Uploading to Walrus");

                toast({
                  title: "Create Project (2/4)",
                  description: "Contracts Generated. Uploading to Walrus...",
                });

                // Create a project with simple metadata and upload to Walrus and send Tx
                const metadata = {
                  name: aiResponse.name,
                  initPrompt: prompt,
                  owner: userAccount.accountId,
                  timestamp: Date.now(),
                };
                const jsonString = JSON.stringify(metadata); // Convert JSON object to string

                const file = new File(
                  [jsonString],
                  (aiResponse.name as string).toLocaleLowerCase() +
                    Math.floor(Math.random() * 100000000001) +
                    ".json",
                  {
                    type: "application/json",
                  }
                );

                const tempBlobId = await uploadToWalrus(
                  file,
                  (blobId) => {
                    setWalrusBlobId(blobId);
                  },
                  (error) => {
                    console.log(error);
                  }
                );

                setStatus("Sending Transaction");
                toast({
                  title: "Create Project (3/4)",
                  description: "Uploaded to Walrus. Intiating transaction...",
                  action: (
                    <ToastAction
                      onClick={() => {
                        window.open(
                          "https://aggregator-devnet.walrus.space/v1/" +
                            tempBlobId,
                          "_blank"
                        );
                      }}
                      altText="View Transaction"
                    >
                      View in Walrus <IconArrowUpRight size={16} />
                    </ToastAction>
                  ),
                });

                const transaction = await wallet.callMethod({
                  contractId: GOJO_CONTRACT,
                  method: "create_project",
                  args: {
                    name: aiResponse.name,
                    metadata_walrus_hash: tempBlobId,
                  },
                  deposit: "0",
                  gas: THIRTY_GAS,
                });
                console.log("All set! Redirecting to Project");
                if (transaction) {
                  toast({
                    title: "Create Project (4/4)",
                    description: "Transaction Success",
                    action: (
                      <ToastAction
                        onClick={() => {
                          console.log(transaction);
                          window.open(
                            "https://testnet.nearblocks.io/txns/" +
                              transaction.hash,
                            "_blank"
                          );
                        }}
                        altText="View Transaction"
                      >
                        View Tx <IconArrowUpRight size={16} />
                      </ToastAction>
                    ),
                  });
                } else {
                  toast({
                    title: "Create Project (4/4)",
                    description: "Transaction Success",
                    action: (
                      <ToastAction
                        onClick={() => {
                          window.open(
                            "https://testnet.nearblocks.io/address/" +
                              GOJO_CONTRACT,
                            "_blank"
                          );
                        }}
                        altText="View Transaction"
                      >
                        View Tx <IconArrowUpRight size={16} />
                      </ToastAction>
                    ),
                  });
                }

                // Store in global state and direct to the project page
                addProject({
                  id: (projects.length + 1).toString(),
                  name: aiResponse.name,
                  initPrompt: prompt,
                });

                setCreateProjectInitNodes(
                  aiResponse.contracts.map((contract: any, idx: number) => {
                    return {
                      id: contract.nodeId,
                      type: "custom",
                      data: {
                        label: contract.label,
                        chainId: contract.chainId,
                        address: zeroAddress,
                        code: contract.code,
                        salt: Math.floor(Math.random() * 100000000001),
                      },
                      position: {
                        x: 0,
                        y: 0,
                      },
                    };
                  })
                );

                router.push("/project/" + (projects.length + 1).toString());
              }}
            >
              <IconArrowUp className="h-5 w-5"></IconArrowUp>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Suggestions setPrompt={setPrompt} />
    </div>
  );
}
