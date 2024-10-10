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
import { Convo, Node } from "@/lib/type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Switch } from "../ui/switch";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
export default function AskGojoSheet({
  open,
  setOpen,
  node,
}: {
  open: boolean;
  setOpen: any;
  node: Node | null;
}) {
  const [label, setLabel] = useState(node ? node.data.label : "");
  const [selectedChainIndex, setSelectedChainIndex] = useState(
    node ? node.data.label : "0"
  );
  const [selectContract, setSelectContract] = useState(node != null);
  const chains = [
    { name: "SKALE", image: "/chains/skale.png" },
    { name: "Neon EVM", image: "/chains/neon.png" },
    { name: "Gnosis Chain", image: "/chains/gnosis.png" },
    { name: "Zircuit", image: "/chains/zircuit.png" },
  ];
  const [prompt, setPrompt] = useState("");
  const [convos, setConvos] = useState<Convo[]>([
    {
      id: "1",
      message:
        "Hello, what can I help with today? This is crazy chad. I am here to help you with your queries.",
      isAi: true,
      node: node,
    },
    {
      id: "2",
      message: "Hello, what can I help with today?",
      isAi: false,
      node: node,
    },
    {
      id: "3",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "4",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "5",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "6",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "7",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "8",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "9",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "10",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "11",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "12",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "13",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "14",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "15",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "16",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "17",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "18",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
    {
      id: "19",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: node,
    },
    {
      id: "20",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: node,
    },
  ]);
  return (
    <Sheet
      open={open}
      onOpenChange={(val: boolean) => {
        setOpen(val);
        setLabel(node ? node.data.label : "");
        setSelectedChainIndex(node ? node.data.chain.name : "0");
        setSelectContract(node != null);
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
          <p>Select Contract</p>
          <Switch
            checked={selectContract}
            onCheckedChange={setSelectContract}
          />
        </div>
        <motion.div
          initial={{ maxHeight: 0, opacity: 0 }}
          animate={
            selectContract
              ? { maxHeight: 500, opacity: 1, display: "block" }
              : { maxHeight: 0, opacity: 0, display: "none" }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`overflow-hidden`}
        >
          <div className="px-4 flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="label" className="text-sm font-medium">
                Label
              </Label>
              <Input
                id="label"
                className="text-xs h-8"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
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
                        <Image
                          src={c.image}
                          alt="chain"
                          width={20}
                          height={20}
                        />
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
          </div>
        </motion.div>
        <Separator />
        <ScrollArea className="flex-1 px-4">
          {convos.map((c) => {
            return (
              <div
                className={`flex space-x-2 py-1 items-center ${
                  !c.isAi ? "justify-end" : ""
                }`}
              >
                {c.isAi && (
                  <Image
                    src={"/logo.png"}
                    width={30}
                    height={30}
                    alt="chat"
                    className="rounded-full"
                  />
                )}
                <Card>
                  <CardContent className={`p-2 ${!c.isAi && "bg-secondary"}`}>
                    <p className="2xl:text-sm text-xs">{c.message}</p>
                  </CardContent>
                </Card>
                {!c.isAi && (
                  <Image
                    src={"/chad.jpg"}
                    width={30}
                    height={30}
                    alt="chat"
                    className="rounded-full"
                  />
                )}
              </div>
            );
          })}
          <ScrollBar orientation="vertical" className="w-1" />
        </ScrollArea>
        <div className="flex pb-3  justify-between space-x-2 px-3">
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button size={"sm"} className="p-3">
            <IconWand className="h-5 w-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
