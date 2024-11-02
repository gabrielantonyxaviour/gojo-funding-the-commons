"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { IconArrowUp, IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { useCallback, useState } from "react";
import Suggestions from "./suggestions";
import { useSendMessage, useStartConversation } from "@xmtp/react-sdk";
import { useRouter } from "next/navigation";
import { useEnvironmentStore } from "../context";
import { createWalletClient, custom } from "viem";
import { skaleEuropaTestnet } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";
import { timestamp } from "rxjs";
import { uploadToWalrus } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GOJO_CONTRACT, THIRTY_GAS } from "@/lib/constants";
import { ToastAction } from "../ui/toast";

export function SearchBar({ conversation }: { conversation: any }) {
  const { prompt, setPrompt, addChat, addProject, projects } =
    useEnvironmentStore((store) => store);
  const { wallet, userAccount } = useEnvironmentStore((store) => store);
  const [walrusUploading, setWalrusUploading] = useState(false);
  const [walrusBlobId, setWalrusBlobId] = useState("");
  const [transactionPending, setTransactionPending] = useState(false);
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
        <CardContent className="p-0">
          <Input
            value={prompt}
            onChange={(e) => [setPrompt(e.target.value)]}
            placeholder="Ask a question or search for answers..."
            className="2xl:text-lg text-md font-medium p-4 bg-transparent border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
          />
          <div className="flex justify-end">
            <Button
              variant={"secondary"}
              className="px-3 py-4 m-2"
              onClick={async () => {
                if (!userAccount) return;
                // Create a project with simple metadata and upload to Walrus and send Tx
                const metadata = {
                  name: "Project",
                  initPrompt: prompt,
                  owner: userAccount.accountId,
                  timestamp: Date.now(),
                };
                const jsonString = JSON.stringify(metadata); // Convert JSON object to string

                const file = new File([jsonString], "project_metadata.json", {
                  type: "application/json",
                });
                setWalrusUploading(true);
                toast({
                  title: "Create Project (1/3)",
                  description: "Uploading Project Metadata to Walrus",
                });
                const tempBlobId = await uploadToWalrus(
                  file,
                  (blobId) => {
                    setWalrusBlobId(blobId);
                    setWalrusUploading(false);
                  },
                  (error) => {
                    console.log(error);
                  }
                );
                toast({
                  title: "Create Project (2/3)",
                  description:
                    "Uploeded Metadata to Walrus. Intiating transaction...",
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
                setTransactionPending(true);

                const transaction = await wallet.callMethod({
                  contractId: GOJO_CONTRACT,
                  method: "create_project",
                  args: {
                    name: metadata.name,
                    metadata_walrus_hash: tempBlobId,
                  },
                  deposit: "0",
                  gas: THIRTY_GAS,
                });
                if (transaction) {
                  toast({
                    title: "Create Project (3/3)",
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
                    title: "Create Project (3/3)",
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

                // TODO: Interact with AI and get title and response
                // TODO: Add chat twice to add both prompt and repsonse
                // TODO: Create nodes with the response from the AI

                // Store in global state and direct to the project page
                addProject({
                  id: (projects.length + 1).toString(),
                  name: "Generated Name XOXOX",
                  initPrompt: prompt,
                });

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
