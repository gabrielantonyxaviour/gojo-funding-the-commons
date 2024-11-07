import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Node } from "@/lib/type";
import { useReactFlow } from "@xyflow/react";
import { chains, GOJO_CONTRACT, THIRTY_GAS } from "@/lib/constants";
import { ToastAction } from "@radix-ui/react-toast";
import { useToast } from "@/hooks/use-toast";
import { useEnvironmentStore } from "../context";
import { IconArrowUpRight } from "@tabler/icons-react";

export default function CreateNodeModal({
  open,
  setOpen,
  onAddNode,
  nodes,
}: {
  open: boolean;
  nodes: Node[];
  setOpen: Dispatch<SetStateAction<boolean>>;
  onAddNode: (data: { label: string; chainId: number; code: string }) => void;
}) {
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedChainIndex, setSelectedChainIndex] = useState("0");
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [ipfsHashUrl, setIpfsHashUrl] = useState<string | null>(null);
  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const { wallet } = useEnvironmentStore((store) => store);
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="w-full">
          <DialogTitle>Create Contract</DialogTitle>
        </DialogHeader>

        <Separator />
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="label" className="text-sm font-semibold">
              Label <span className="text-red-400">*</span>
            </Label>
            <Input
              id="label"
              className="text-xs h-8"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
              }}
            />
            <Label
              htmlFor="label"
              className="text-xs font-medium text-muted-foreground"
            >
              The name by which you reference this contract.
            </Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Chain <span className="text-red-400">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex space-x-2">
                  {selectedChainIndex == "0" ? (
                    <p>Choose Chain</p>
                  ) : (
                    <>
                      <Image
                        src={chains[parseInt(selectedChainIndex) - 1].image}
                        alt="selected"
                        width={20}
                        height={20}
                      />
                      <p>{chains[parseInt(selectedChainIndex) - 1].name}</p>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup
                  value={selectedChainIndex}
                  onValueChange={setSelectedChainIndex}
                >
                  {chains.map((c, idx) => (
                    <DropdownMenuRadioItem
                      key={idx}
                      value={(idx + 1).toString()}
                      className="flex space-x-2"
                    >
                      <Image src={c.image} alt="chain" width={20} height={20} />{" "}
                      <p>{c.name}</p>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Label
              htmlFor="name"
              className="text-xs text-muted-foreground font-medium"
            >
              The chain in which you want to deploy this contract.
            </Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="prompt" className="text-sm font-semibold">
              Prompt <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="prompt"
              className="text-xs h-8"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Label
              htmlFor="prompt"
              className="text-xs text-muted-foreground font-medium"
            >
              The AI prompt to create the contract.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant={"ghost"}
            onClick={() => {
              setLabel("");
              setPrompt("");
              setSelectedChainIndex("0");
            }}
          >
            Reset
          </Button>
          <Button
            disabled={selectedChainIndex == "0" || label == "" || prompt == ""}
            onClick={async () => {
              const regex = /^[A-Z][a-zA-Z]*$/;
              if (!regex.test(label)) {
                toast({
                  variant: "destructive",
                  title: "Invalid Label",
                  description: "Label should be in Upper Camel Case.",
                });
                return;
              } else if (
                nodes.filter((node) => node.data.label === label).length > 0
              ) {
                toast({
                  variant: "destructive",
                  title: "Invalid Label",
                  description: "Label already exists.",
                });
                return;
              }
              toast({
                title: "Make Generation (1/4)",
                description: "Waiting for Response from the AI Agent...",
              });

              // TODO: Generate code form prompt
              const solidityCode = `
              pragma solidity ^0.8.0;
            
              contract MyToken {
                  string public name = "My Token";
                  string public symbol = "MTK";
                  uint256 public totalSupply = 1000000;
            
                  mapping(address => uint256) public balanceOf;
            
                  constructor() {
                      balanceOf[msg.sender] = totalSupply;
                  }
            
                  function transfer(address to, uint256 amount) public {
                      require(balanceOf[msg.sender] >= amount, "Insufficient balance");
                      balanceOf[msg.sender] -= amount;
                      balanceOf[to] += amount;
                  }
              }
            `;
              onAddNode({
                label: label,
                chainId: chains[parseInt(selectedChainIndex) - 1].chainId,
                code: solidityCode,
              });

              const aiResponse = {
                name: "generation",
              };
              const projectId = "0";

              const jsonString = JSON.stringify(aiResponse); // Convert JSON object to string

              const file = new File(
                [jsonString],
                "generation-" +
                  Math.floor(Math.random() * 100000000001).toString() +
                  ".json",
                {
                  type: "application/json",
                }
              );

              toast({
                title: "Make Generation (2/4)",
                description: "Uploading Generation to IPFS...",
              });

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
                description: "Uploaded to IPFS. Initiating Transaction...",
                action: (
                  <ToastAction
                    onClick={() => {
                      window.open(url, "_blank");
                    }}
                    altText="View Transaction"
                  >
                    View <IconArrowUpRight size={16} />
                  </ToastAction>
                ),
              });
              setTransactionPending(true);
              const transaction = await wallet.callMethod({
                contractId: GOJO_CONTRACT,
                method: "make_generation",
                args: {
                  project_id: projectId,
                  agents_used: [1, 2, 3],
                  generation_walrus_hash: url,
                },
                deposit: "0",
                gas: THIRTY_GAS,
              });
              if (transaction) {
                toast({
                  title: "Make Generation (4/4)",
                  description:
                    "Transaction Success. Code Generated Successfully.",
                  action: (
                    <ToastAction
                      onClick={() => {
                        console.log(txHash);
                        window.open(
                          "https://testnet.nearblocks.io/txns/" + txHash,
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
                  title: "Make Generation (4/4)",
                  description:
                    "Transaction Success. Code Generated Successfully",
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
              setOpen(false);
              setLabel("");
              setPrompt("");
              setSelectedChainIndex("0");
            }}
          >
            Create Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
