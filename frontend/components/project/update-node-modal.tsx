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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { chains, idToChain } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function UpdateNodeModal({
  nodeId,
  initLabel,
  initChainId,
  open,
  setOpen,
  onChangeNode,
}: {
  nodeId: string;
  initLabel: string;
  initChainId: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onChangeNode: (data: {
    nodeId: string;
    label: string;
    chainId: number;
  }) => void;
}) {
  const [label, setLabel] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number>(0);
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setLabel(initLabel);
      setSelectedChainId(initChainId);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="w-full">
          <DialogTitle>Update Contract</DialogTitle>
        </DialogHeader>

        <Separator />
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="label" className="text-sm font-semibold">
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
            <Label
              htmlFor="label"
              className="text-xs font-medium text-muted-foreground"
            >
              The name by which you reference this contract.
            </Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Chain
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex space-x-2">
                  {selectedChainId == 0 ? (
                    <p>Choose Chain</p>
                  ) : (
                    <>
                      <Image
                        src={idToChain[selectedChainId].image}
                        alt="selected"
                        width={20}
                        height={20}
                      />
                      <p>{idToChain[selectedChainId].name}</p>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup
                  value={selectedChainId.toString()}
                  onValueChange={(val: string) => {
                    setSelectedChainId(parseInt(val));
                  }}
                >
                  {chains.map((c, idx) => (
                    <DropdownMenuRadioItem
                      key={idx}
                      value={c.chainId.toString()}
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
        </div>

        <DialogFooter>
          <Button
            variant={"ghost"}
            onClick={() => {
              setLabel("");
              setSelectedChainId(0);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={selectedChainId == 0 || label == ""}
            onClick={() => {
              const regex = /^[A-Z][a-zA-Z]*$/;
              if (!regex.test(label)) {
                toast({
                  variant: "destructive",
                  title: "Invalid Label",
                  description: "Label should be in Upper Camel Case.",
                });
                return;
              }
              onChangeNode({
                nodeId: nodeId,
                label: label,
                chainId: selectedChainId,
              });
              setOpen(false);
              setLabel("");
              setSelectedChainId(0);
            }}
          >
            Update Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
