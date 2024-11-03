import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
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
import { chains, idToChain } from "@/lib/constants";
import { useWallets } from "@privy-io/react-auth";
import { useSendMessage, useStreamMessages } from "@xmtp/react-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, parseGwei, zeroAddress } from "viem";
import { polygonAmoy, skaleEuropaTestnet, storyTestnet } from "viem/chains";
import { title } from "process";
import { ToastAction } from "@radix-ui/react-toast";
import { useToast } from "@/hooks/use-toast";
export default function AskGojoSheet({
  id,
  onAddNode,
  nodes,
}: {
  id: string;
  onAddNode: (data: { label: string; chainId: number; code: string }) => void;
  nodes: Node[];
}) {
  const { askGojo, setNodeOpenAskGojo, conversations, addChat } =
    useEnvironmentStore((store) => store);
  // const { wallets } = useWallets();
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
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
                              : n.data.label.length}
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
                  {/* {!c.isGojo && (
                  <img
                    src={`https://noun-api.com/beta/pfp?name=${wallets[0].address}`}
                    width={30}
                    height={30}
                    alt="nouns_pfp"
                    className="rounded-full my-2 "
                  />
                )} */}
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
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button
            size={"sm"}
            className="p-3"
            disabled={selectedContract && askGojo.node == null}
            // onClick={async () => {
            //   setConvos([
            //     ...convos,
            //     {
            //       id: convos.length.toString(),
            //       message: prompt,
            //       isAi: false,
            //       node: null,
            //     },
            //   ]);
            //   setPrompt("");
            //   setWaiting(true);
            //   await new Promise((resolve) => setTimeout(resolve, 12000));
            //   setWaiting(false);
            //   const account = privateKeyToAccount(
            //     process.env.NEXT_PUBLIC_XMTP_PRIVATE_KEY as `0x${string}`
            //   );
            //   const walletClient = createWalletClient({
            //     account,
            //     chain: skaleEuropaTestnet,
            //     transport: http(),
            //   });
            //   const inputOne: readonly [bigint, readonly number[], bigint] = [
            //     BigInt("1"),
            //     [1],
            //     BigInt("50000000000000000"),
            //   ];
            //   const inputTwo: readonly [bigint, readonly number[], bigint] = [
            //     BigInt("1"),
            //     [2],
            //     BigInt("70000000000000000"),
            //   ];

            //   try {
            //     const { request } = await skalePublicClient.simulateContract({
            //       address: "0x649d81f1A8F4097eccA7ae1076287616E433c5E8",
            //       abi: [
            //         {
            //           inputs: [
            //             {
            //               internalType: "uint256",
            //               name: "_projectId",
            //               type: "uint256",
            //             },
            //             {
            //               internalType: "uint32[]",
            //               name: "newAiAgentsUsed",
            //               type: "uint32[]",
            //             },
            //             {
            //               internalType: "uint256",
            //               name: "_ipConsumption",
            //               type: "uint256",
            //             },
            //           ],
            //           name: "registerGeneration",
            //           outputs: [],
            //           stateMutability: "nonpayable",
            //           type: "function",
            //         },
            //       ],
            //       functionName: "registerGeneration",
            //       args: convos.length < 2 ? inputOne : inputTwo,
            //       account:
            //         "0xbE9044946343fDBf311C96Fb77b2933E2AdA8B5D" as `0x${string}`,
            //     });
            //     const hash = await walletClient.writeContract(request);
            //     toast({
            //       title: "Transaction Sent",
            //       description: `Transaction hash: ${hash}`,
            //       action: (
            //         <ToastAction
            //           altText="Goto schedule to undo"
            //           onClick={() => {
            //             window.open(
            //               "https://juicy-low-small-testnet.explorer.testnet.skalenodes.com/tx/" +
            //                 hash,
            //               "_blank"
            //             );
            //           }}
            //         >
            //           View Tx
            //         </ToastAction>
            //       ),
            //     });
            //   } catch (e) {
            //     console.log(e);
            //   }
            //   setConvos([
            //     ...convos,
            //     {
            //       id: convos.length.toString(),
            //       message: prompt,
            //       isAi: false,
            //       node: null,
            //     },
            //     {
            //       id: (convos.length + 1).toString(),
            //       message: "Created Crosschain Airdrop contract",
            //       isAi: true,
            //       node: null,
            //     },
            //   ]);
            //   setOpenAskGojo(false);

            //   if (convos.length < 2) {
            //     onAddNode({
            //       label: label,
            //       chain: chains[0],
            //     });
            //     onAddNode({
            //       label: label,
            //       chain: chains[2],
            //     });
            //   }
            // }}
          >
            <IconWand className="h-5 w-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
