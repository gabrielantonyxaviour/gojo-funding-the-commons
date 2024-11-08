import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconWand,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Chain, Convo, Node } from "@/lib/type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Switch } from "../ui/switch";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { useEnvironmentStore } from "../context";
import {
  AI_HOSTED_URL,
  AI_LOCAL_URL,
  chains,
  GOJO_CONTRACT,
  idToChain,
  THIRTY_GAS,
} from "@/lib/constants";
import { useWallets } from "@privy-io/react-auth";
import { useSendMessage, useStreamMessages } from "@xmtp/react-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, parseGwei, zeroAddress } from "viem";
import { polygonAmoy, skaleEuropaTestnet, storyTestnet } from "viem/chains";
import { title } from "process";
import { ToastAction } from "@radix-ui/react-toast";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
export default function AskGojoSheet({
  id,
  onAddNode,
  nodes,
}: {
  id: string;
  onAddNode: (data: { label: string; chainId: number; code: string }) => void;
  nodes: Node[];
}) {
  const {
    askGojo,
    setNodeOpenAskGojo,
    conversations,
    addChat,
    signedAccountId,
    setCreateProjectInitNodes,
    wallet,
    projects,
  } = useEnvironmentStore((store) => store);
  // const { wallets } = useWallets();
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [ipfsHashUrl, setIpfsHashUrl] = useState<string>("");
  const pathName = usePathname();
  useEffect(() => {
    if (askGojo.node != null) setSelectedContract(true);
  }, [askGojo]);

  // const [wating, setWaiting] = useState(false);
  // useStreamMessages(conversation);
  // const { sendMessage } = useSendMessage();

  // const handleSendMessage = async (newMessage: string) => {
  //   if (!newMessage.trim()) {
  //     alert("empty message");
  //     return;
  //   }
  //   if (conversation && conversation.peerAddress) {
  //     await sendMessage(conversation, newMessage);
  //   }
  // };

  return (
    <Sheet
      open={askGojo.open}
      onOpenChange={(val: boolean) => {
        setNodeOpenAskGojo({
          open: val,
          node: val ? askGojo.node : null,
        });
      }}
    >
      <SheetContent side={"right"} className="p-0 flex flex-col space-y-0">
        <SheetHeader className="pt-3">
          <div className="flex justify-center items-center space-x-2">
            <IconWand className="h-7 w-7 text-neutral-500 dark:text-neutral-300" />
            <p className="2xl:text-xl text-md font-semibold">Ask Gojo</p>
          </div>
        </SheetHeader>
        <Separator className="mb-0" />
        <div className="flex justify-center space-x-4 items-center">
          <p className="font-semibold text-sm">Select Contract</p>

          <Switch
            checked={selectedContract}
            onCheckedChange={(val: boolean) => {
              setSelectedContract(val);
            }}
          />
        </div>
        <motion.div
          initial={{ maxHeight: 0, opacity: 0 }}
          animate={
            selectedContract
              ? { maxHeight: 500, opacity: 1, display: "block" }
              : { maxHeight: 0, opacity: 0, display: "none" }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`overflow-hidden`}
        >
          <div className="px-4 flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="label" className="text-sm font-semibold">
                Contract <span className="text-red-400">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex space-x-2">
                    {askGojo.node == null ? (
                      <p>Choose Contract</p>
                    ) : (
                      <>
                        <p>{askGojo.node.data.label}</p>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={askGojo.node != null ? askGojo.node.id : "0"}
                    onValueChange={(val: string) => {
                      setNodeOpenAskGojo({
                        open: true,
                        node: nodes[parseInt(val) - 1],
                      });
                    }}
                  >
                    {nodes.length == 0 ? (
                      <div className="flex justify-center p-2">
                        <p className="text-sm text-muted-foreground text-center">
                          You have no available contracts.
                        </p>
                      </div>
                    ) : (
                      nodes.map((n, idx) => (
                        <DropdownMenuRadioItem
                          key={n.id}
                          value={n.id}
                          className="flex space-x-2"
                        >
                          <p>
                            {n.data.label.length > 14
                              ? n.data.label.slice(0, 7) +
                                " ... " +
                                n.data.label.slice(-8)
                              : n.data.label}
                          </p>
                        </DropdownMenuRadioItem>
                      ))
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Label
                htmlFor="label"
                className="text-xs text-muted-foreground font-medium"
              >
                The name by which you reference this contract.
              </Label>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Chain <span className="text-red-400">*</span>
              </Label>

              <Button
                variant="outline"
                className="flex space-x-2"
                disabled={true}
              >
                {askGojo.node == null ? (
                  <p>Choose Chain</p>
                ) : (
                  <>
                    <Image
                      src={idToChain[askGojo.node.data.chainId].image}
                      alt="selected"
                      width={20}
                      height={20}
                    />
                    <p>{idToChain[askGojo.node.data.chainId].name}</p>
                  </>
                )}
              </Button>

              <Label
                htmlFor="name"
                className="text-xs text-muted-foreground font-medium"
              >
                The chain in which you want to deploy this contract.
              </Label>
            </div>
          </div>
        </motion.div>
        <Separator />
        <ScrollArea className="flex-1 px-4">
          <div key={"0"} className={`flex space-x-2 py-1 items-center`}>
            <Image
              src={"/logo-nouns.png"}
              width={30}
              height={30}
              alt="chat"
              className="rounded-full"
            />
            <Card>
              <CardContent className={`p-2 `}>
                <p className="2xl:text-sm text-xs">
                  Hey Degen! What can I help you ship today?
                </p>
              </CardContent>
            </Card>
          </div>
          {conversations[id] &&
            conversations[id].map((c) => {
              return (
                <div
                  key={c.id}
                  className={`flex space-x-2 py-1 items-center ${
                    !c.isGojo ? "justify-end" : ""
                  }`}
                >
                  {c.isGojo && (
                    <Image
                      src={"/logo-nouns.png"}
                      width={30}
                      height={30}
                      alt="chat"
                      className="rounded-full"
                    />
                  )}
                  <Card>
                    <CardContent
                      className={`p-2 ${!c.isGojo && "bg-secondary"}`}
                    >
                      <p className="2xl:text-sm text-xs">{c.message}</p>
                    </CardContent>
                  </Card>
                  {!c.isGojo && (
                    <img
                      src={`https://noun-api.com/beta/pfp?name=${signedAccountId}`}
                      width={30}
                      height={30}
                      alt="nouns_pfp"
                      className="rounded-full my-2 "
                    />
                  )}
                </div>
              );
            })}
          {/* {wating && (
            <div
              key={convos.length}
              className={`flex space-x-2 py-1 items-center`}
            >
              <Image
                src={"/logo-nouns.png"}
                width={30}
                height={30}
                alt="chat"
                className="rounded-full"
              />
              <Card>
                <CardContent className={`p-2 `}>
                  <p className="2xl:text-sm text-xs">{". . ."}</p>
                </CardContent>
              </Card>
            </div>
          )} */}
          <ScrollBar orientation="vertical" className="w-1" />
        </ScrollArea>
        <div className="flex pb-3  justify-between space-x-2 px-3">
          <Input
            disabled={loading}
            value={loading ? "" : prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            size={"sm"}
            className="p-3"
            disabled={(selectedContract && askGojo.node == null) || loading}
            onClick={async () => {
              setLoading(true);
              toast({
                title: "Make Generation (1/4)",
                description: " Generating Code...",
              });
              addChat(id, {
                id:
                  conversations[id] == null
                    ? "1"
                    : conversations[id].length.toString(),
                isGojo: false,
                message: prompt,
                reference_node_hash: askGojo.node ? askGojo.node.id : "",
                contracts: nodes.map((n) => {
                  return {
                    nodeId: n.id,
                    chainId: n.data.chainId,
                    code: n.data.code,
                    label: n.data.label,
                  };
                }),
              });
              let aiResponse;
              const IS_LOCAL = JSON.parse(
                process.env.NEXT_PUBLIC_IS_LOCAL || "false"
              );
              console.log(IS_LOCAL ? AI_LOCAL_URL : AI_HOSTED_URL);
              try {
                const res = await fetch(
                  IS_LOCAL ? AI_LOCAL_URL : AI_HOSTED_URL,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      message: prompt,
                      contracts: nodes.map((n) => {
                        return {
                          nodeId: n.id,
                          chainId: n.data.chainId,
                          code: n.data.code,
                          label: n.data.label,
                        };
                      }),
                      selectedContract:
                        selectedContract && askGojo.node
                          ? askGojo.node.id
                          : null,
                      selectedConnection: null,
                      name: "",
                      thread_id:
                        projects[parseInt(pathName.split("/")[2]) - 1].threadId,
                    }),
                  }
                );
                aiResponse = await res.json();
                console.log(aiResponse);

                console.log(aiResponse);
                addChat(id, {
                  id:
                    conversations[id] == null
                      ? "2"
                      : conversations[id].length.toString(),
                  isGojo: true,
                  message: aiResponse.message,
                  reference_node_hash: "",
                  contracts: aiResponse.contracts,
                });
                setCreateProjectInitNodes(
                  aiResponse.contracts.map((contract: any) => {
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
                toast({
                  title: "Make Generation (2/4)",
                  description: "Code Generated. Uploading to IPFS...",
                });
                const metadata = {
                  id:
                    conversations[id] == null
                      ? "2"
                      : conversations[id].length.toString(),
                  isGojo: true,
                  message: aiResponse.message,
                  reference_node_hash: "",
                  contracts: aiResponse.contracts,
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

                const data = new FormData();
                data.set("file", file);
                const uploadRequest = await fetch("/api/pinata/store", {
                  method: "POST",
                  body: data,
                });
                const { cid, url } = await uploadRequest.json();
                setIpfsHash(cid);
                setIpfsHashUrl(url);

                toast({
                  title: "Make Generation (3/4)",
                  description: "Uploaded To IPFS. Sending Transaction...",
                  action: (
                    <ToastAction
                      onClick={() => {
                        window.open(url, "_blank");
                      }}
                      altText="View Transaction"
                    >
                      View in IPFS <IconArrowUpRight size={16} />
                    </ToastAction>
                  ),
                });

                try {
                  const transaction = await wallet.callMethod({
                    contractId: GOJO_CONTRACT,
                    method: "make_generation",
                    args: {
                      project_id: id,
                      agents_used: [1, 2],
                      generation_walrus_hash: url,
                    },
                    deposit: "0",
                    gas: THIRTY_GAS,
                  });
                } catch (e) {
                  console.log(e);

                  toast({
                    title: "Make Generation (4/4)",
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

                setLoading(false);
                setPrompt("");
              } catch (e) {
                toast({
                  title: "Make Generation Failed.",
                  description:
                    "Something wrong with AI. If issue persist, contact @gabrielaxyy in Telegram",
                });
                console.log(e);
              }
            }}
          >
            {loading ? (
              <div className="black-spinner"></div>
            ) : (
              <IconWand className="h-5 w-5" />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
