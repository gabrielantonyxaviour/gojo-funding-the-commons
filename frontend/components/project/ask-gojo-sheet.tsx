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
export default function AskGojoSheet({
  askGojo,
}: {
  askGojo: { open: boolean; node: Node | null };
}) {
  const { setOpenAskGojo, setNodeOpenAskGojo } = useEnvironmentStore(
    (store) => store
  );

  const [label, setLabel] = useState("");
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [selectContract, setSelectContract] = useState(false);
  const chains: Chain[] = [
    { name: "SKALE", chainId: 69, image: "/chains/skale.png" },
    { name: "Neon EVM", chainId: 21, image: "/chains/neon.png" },
    { name: "Gnosis Chain", chainId: 33, image: "/chains/gnosis.png" },
    { name: "Zircuit", chainId: 4423, image: "/chains/zircuit.png" },
  ];
  const [prompt, setPrompt] = useState("");
  const [convos, setConvos] = useState<Convo[]>([
    {
      id: "1",
      message:
        "Hello, what can I help with today? This is crazy chad. I am here to help you with your queries.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "2",
      message: "Hello, what can I help with today?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "3",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "4",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "5",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "6",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "7",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "8",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "9",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "10",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "11",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "12",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "13",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "14",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "15",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "16",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "17",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "18",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
    {
      id: "19",
      message: "I am trying to deploy a contract.",
      isAi: true,
      node: askGojo.node,
    },
    {
      id: "20",
      message: "What contract are you trying to deploy?",
      isAi: false,
      node: askGojo.node,
    },
  ]);

  useEffect(() => {
    if (askGojo.open) {
      setLabel(askGojo.node ? askGojo.node.data.label : "");
      setSelectedChain(askGojo.node ? askGojo.node.data.chain : null);
      setSelectContract(askGojo.node != null);
    }
  }, [askGojo.open]);

  return (
    <Sheet
      open={askGojo.open}
      onOpenChange={(val: boolean) => {
        if (val == false) {
          setLabel("");
          setSelectedChain(null);
          setSelectContract(false);

          setNodeOpenAskGojo({
            open: false,
            node: null,
          });
        } else {
          setNodeOpenAskGojo({
            open: true,
            node: askGojo.node,
          });
        }
      }}
    >
      <SheetContent side={"right"} className="p-0 flex flex-col space-y-0">
        <SheetHeader className="pt-3">
          <div className="flex justify-center items-center space-x-2">
            <IconWand className="h-7 w-7 text-neutral-500 dark:text-neutral-300" />
            <p className="2xl:text-xl text-md font-medium">Ask Gojo</p>
          </div>
        </SheetHeader>
        <Separator className="mb-0" />
        <div className="flex justify-center space-x-4 items-center">
          <p>Select Contract</p>
          <Switch
            checked={selectContract}
            onCheckedChange={(val: boolean) => {
              if (val) {
                setSelectContract(true);
              } else {
                setLabel("");
                setSelectedChain(null);
                setSelectContract(false);
              }
            }}
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
                    {selectedChain == null ? (
                      <p>Choose Chain</p>
                    ) : (
                      <>
                        <Image
                          src={selectedChain.image}
                          alt="selected"
                          width={20}
                          height={20}
                        />
                        <p>{selectedChain.name}</p>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={
                      selectedChain != null
                        ? (chains.indexOf(selectedChain) + 1).toString()
                        : "0"
                    }
                    onValueChange={(val: string) => {
                      setSelectedChain(chains[parseInt(val) - 1]);
                    }}
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
                key={c.id}
                className={`flex space-x-2 py-1 items-center ${
                  !c.isAi ? "justify-end" : ""
                }`}
              >
                {c.isAi && (
                  <Image
                    src={"/logo-nouns.png"}
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
