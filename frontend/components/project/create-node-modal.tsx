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

export default function CreateNodeModal({
  open,
  setOpen,
  onAddNode,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onAddNode: (data: {
    label: string;
    chain: { name: string; chainId: number; image: string };
  }) => void;
}) {
  const chains = [
    { name: "SKALE", chainId: 69, image: "/chains/skale.png" },
    { name: "Neon EVM", chainId: 21, image: "/chains/neon.png" },
    { name: "Gnosis Chain", chainId: 33, image: "/chains/gnosis.png" },
    { name: "Zircuit", chainId: 4423, image: "/chains/zircuit.png" },
  ];
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedChainIndex, setSelectedChainIndex] = useState("0");
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="w-full">
          <DialogTitle>Create Contract</DialogTitle>
        </DialogHeader>

        <Separator />
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="label" className="text-sm font-medium">
              Label
            </Label>
            <Input
              id="label"
              className="text-xs h-8"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
              }}
            />
            <Label htmlFor="label" className="text-xs text-muted-foreground">
              The name by which you reference this contract.
            </Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Chain
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
            <Label htmlFor="name" className="text-xs text-muted-foreground">
              The chain in which you want to deploy this contract.
            </Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              className="text-xs h-8"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Label htmlFor="prompt" className="text-xs text-muted-foreground">
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
            onClick={() => {
              onAddNode({
                label: label,
                chain: chains[parseInt(selectedChainIndex) - 1],
              });
              setOpen(false);
              setLabel("");
              setPrompt("");
              setSelectedChainIndex("0");
            }}
          >
            Add node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
