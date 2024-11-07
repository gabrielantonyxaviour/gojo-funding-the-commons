import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
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
import { zeroAddress } from "viem";
import { ALT_CODE, chains, idToChain } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";
import { WineOff } from "lucide-react";
import { baseSepolia, polygonAmoy, sepolia } from "viem/chains";
import { deployContract } from "@/lib/alt/deployContract";
import { toast } from "@/hooks/use-toast";
export default function DeployAppSheet({ nodes }: { nodes: Node[] }) {
  const {
    appSettings,
    setNodeOpenAppSettings,
    evmUserAddress,
    ethBalance,
    baseBalance,
    projects,
    polBalance,
    wallet,
    setViewCodeNodeId,
  } = useEnvironmentStore((store) => store);

  const [selectedContract, setSelectedContract] = useState<boolean>(false);
  const [requiredEthBalance, setRequiredEthBalance] = useState<number>(0);
  const [requiredPolBalance, setRequiredPolBalance] = useState<number>(0);
  const [requiredBaseBalance, setRequiredBaseBalance] = useState<number>(0);
  const [cannotDeploy, setCannotDeploy] = useState<boolean>(false);

  useEffect(() => {
    if (appSettings.node != null) setSelectedContract(true);
  }, [appSettings]);

  useEffect(() => {
    if (selectedContract && appSettings.node) {
      setRequiredEthBalance(
        appSettings.node.data.chainId == sepolia.id ? 0.02 : 0
      );
      setRequiredPolBalance(
        appSettings.node.data.chainId == polygonAmoy.id ? 0.1 : 0
      );
      setRequiredBaseBalance(
        appSettings.node.data.chainId == baseSepolia.id ? 0.005 : 0
      );
    } else {
      const tempBalances = [0, 0, 0];
      nodes.forEach((node) => {
        if (node.data.chainId == sepolia.id) {
          tempBalances[0] += 0.02;
        } else if (node.data.chainId == polygonAmoy.id) {
          tempBalances[1] += 0.1;
        } else if (node.data.chainId == baseSepolia.id) {
          tempBalances[2] += 0.005;
        }
      });
      setRequiredEthBalance(tempBalances[0]);
      setRequiredPolBalance(tempBalances[1]);
      setRequiredBaseBalance(tempBalances[2]);
    }
  }, [selectedContract, appSettings, nodes]);

  useEffect(() => {
    console.log("NODES");
    console.log(nodes);
    setCannotDeploy(
      (selectedContract &&
        appSettings.node &&
        appSettings.node.data.chainId == sepolia.id &&
        requiredEthBalance > parseFloat(ethBalance)) ||
        (!(selectedContract && appSettings.node == null) &&
          requiredEthBalance > parseFloat(ethBalance)) ||
        (selectedContract &&
          appSettings.node &&
          appSettings.node.data.chainId == polygonAmoy.id &&
          requiredPolBalance > parseFloat(polBalance)) ||
        (!(selectedContract && appSettings.node == null) &&
          requiredPolBalance > parseFloat(polBalance)) ||
        (selectedContract &&
          appSettings.node &&
          appSettings.node.data.chainId == baseSepolia.id &&
          requiredBaseBalance > parseFloat(baseBalance)) ||
        (!(selectedContract && appSettings.node == null) &&
          requiredBaseBalance > parseFloat(baseBalance))
    );
  }, [requiredBaseBalance, requiredEthBalance, requiredPolBalance]);

  return (
    <Sheet
      open={appSettings.open}
      onOpenChange={(val: boolean) => {
        setNodeOpenAppSettings({
          open: val,
          node: val ? appSettings.node : null,
        });
      }}
    >
      <SheetContent side={"right"} className="p-0 flex flex-col space-y-0">
        <SheetHeader className="pt-3">
          <div className="flex justify-center items-center space-x-2">
            <IconSettings className="h-7 w-7 text-neutral-500 dark:text-neutral-300" />
            <p className="2xl:text-xl text-md font-semibold">Deploy App</p>
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
                    {appSettings.node == null ? (
                      <p>Choose Contract</p>
                    ) : (
                      <>
                        <p>{appSettings.node.data.label}</p>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={appSettings.node != null ? appSettings.node.id : "0"}
                    onValueChange={(val: string) => {
                      setNodeOpenAppSettings({
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
                          <p>{n.data.label}</p>
                        </DropdownMenuRadioItem>
                      ))
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Label htmlFor="label" className="text-xs text-muted-foreground">
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
                {appSettings.node == null ? (
                  <p>Choose Chain</p>
                ) : (
                  <>
                    <Image
                      src={idToChain[appSettings.node.data.chainId].image}
                      alt="selected"
                      width={20}
                      height={20}
                    />
                    <p>{idToChain[appSettings.node.data.chainId].name}</p>
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
        <ScrollArea className="flex-1 ">
          {(selectedContract
            ? nodes.filter(
                (n: Node) =>
                  n.id == (appSettings.node ? appSettings.node.id : "")
              )
            : nodes
          ).map((n: Node, idx: number) => (
            <Card
              key={n.id}
              className={`rounded-none border-0 bg-neutral-900 ${
                appSettings.node != null && appSettings.node.id == n.id
                  ? "border-primary-500"
                  : ""
              }`}
            >
              <CardContent className="py-3">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3 items-center">
                    <img
                      src={`https://noun-api.com/beta/pfp?name=${n.data.salt.toString()}`}
                      alt="noun"
                      width={33}
                      height={33}
                      className="rounded-full"
                    />
                    <p className="text-sm">{n.data.label}.sol</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size={"sm"}
                      className="text-xs"
                      onClick={() => {
                        setViewCodeNodeId(n.id);
                      }}
                    >
                      View Code
                    </Button>
                    <Image
                      src={idToChain[n.data.chainId].image}
                      width={25}
                      height={25}
                      alt="chain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* {convos.map((c) => {
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
          })} */}
          <ScrollBar orientation="vertical" className="w-1" />
        </ScrollArea>
        <div className="">
          <Card className="rounded-none border-x-0 bg-neutral-900">
            <CardContent className="py-2">
              <div className="flex justify-around">
                {(!(selectedContract && appSettings.node) ||
                  requiredEthBalance > 0) && (
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      window.open(
                        `https://sepolia.etherscan.io/address/${evmUserAddress}`,
                        "_blank"
                      );
                    }}
                    className={`hover:bg-transparent flex space-x-1 p-2 ${
                      (selectedContract &&
                        appSettings.node &&
                        appSettings.node.data.chainId == sepolia.id &&
                        requiredEthBalance > parseFloat(ethBalance)) ||
                      (!(selectedContract && appSettings.node == null) &&
                        requiredEthBalance > parseFloat(ethBalance))
                        ? "text-red-500 hover:text-red-500"
                        : "text-stone-400 hover:text-white"
                    }  hover:scale-105 transition ease-in-out duration-200 `}
                  >
                    <Image
                      src={"/chains/eth.png"}
                      width={20}
                      height={20}
                      alt="eth"
                      className=""
                    />
                    <p className="text-xs pl-[2px]">
                      {parseFloat(ethBalance).toFixed(2)}
                    </p>
                    <p className="text-xs">ETH</p>
                    <IconArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
                {(!(selectedContract && appSettings.node) ||
                  requiredPolBalance > 0) && (
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      window.open(
                        `https://amoy.polygonscan.com/address/${evmUserAddress}`,
                        "_blank"
                      );
                    }}
                    className={`hover:bg-transparent flex space-x-1 p-2 ${
                      (selectedContract &&
                        appSettings.node &&
                        appSettings.node.data.chainId == polygonAmoy.id &&
                        requiredPolBalance > parseFloat(polBalance)) ||
                      (!(selectedContract && appSettings.node == null) &&
                        requiredPolBalance > parseFloat(polBalance))
                        ? "text-red-500 hover:text-red-500"
                        : "text-stone-400 hover:text-white"
                    }  hover:scale-105 transition ease-in-out duration-200 `}
                  >
                    <Image
                      src={"/chains/pol.png"}
                      width={20}
                      height={20}
                      alt="pol"
                      className=""
                    />
                    <p className="text-xs pl-[2px]">
                      {parseFloat(polBalance).toFixed(2)}
                    </p>
                    <p className="text-xs">POL</p>
                    <IconArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
                {(!(selectedContract && appSettings.node) ||
                  requiredBaseBalance > 0) && (
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      window.open(
                        `https://sepolia.basescan.org/address/${evmUserAddress}`,
                        "_blank"
                      );
                    }}
                    className={`hover:bg-transparent flex space-x-1 p-2 ${
                      (selectedContract &&
                        appSettings.node &&
                        appSettings.node.data.chainId == baseSepolia.id &&
                        requiredBaseBalance > parseFloat(baseBalance)) ||
                      (!(selectedContract && appSettings.node == null) &&
                        requiredBaseBalance > parseFloat(baseBalance))
                        ? "text-red-500 hover:text-red-500"
                        : "text-stone-400 hover:text-white"
                    }  hover:scale-105 transition ease-in-out duration-200 `}
                  >
                    <Image
                      src={"/chains/base.png"}
                      width={20}
                      height={20}
                      alt="base"
                      className=""
                    />
                    <p className="text-xs pl-[2px]">
                      {parseFloat(baseBalance).toFixed(2)}
                    </p>
                    <p className="text-xs">ETH</p>
                    <IconArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full px-4 pb-4 flex justify-center">
          <Button
            className="flex-1"
            disabled={
              nodes.length == 0 ||
              (selectedContract && appSettings.node == null) ||
              cannotDeploy
            }
            onClick={async () => {
              const IS_LOCAL = Boolean(
                process.env.NEXT_PUBLIC_IS_LOCAL || "false"
              );

              if (selectedContract) {
                if (!appSettings.node) return;
                const contractCode = appSettings.node.data.code;
                const contractLabel = appSettings.node.data.label;
                console.log({
                  contractCode,
                  contractLabel,
                });
                toast({
                  title: "Deploy Contract (1/3)",
                  description: "Compiling " + contractLabel + ".sol ...",
                });
                try {
                  // TODO: Replace local url
                  const res = await fetch("http://localhost:3001/compile", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      contractCode: contractCode,
                      name: contractLabel,
                    }),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    console.log("Success");
                    console.log(data);

                    sessionStorage.setItem(
                      "projects",
                      JSON.stringify(projects)
                    );
                    sessionStorage.setItem("nodes", JSON.stringify(nodes));
                    sessionStorage.setItem(
                      "appSettings",
                      JSON.stringify(appSettings)
                    );
                    toast({
                      title: "Deploy Contract (2/3)",
                      description:
                        "Deploying " +
                        contractLabel +
                        ".sol on " +
                        idToChain[appSettings.node.data.chainId].name,
                    });
                    await deployContract(
                      evmUserAddress,
                      appSettings.node.data.chainId,
                      "0x" + data.bytecode,
                      wallet
                    );

                    // await deployContracts(
                    //   evmUserAddress,
                    //   [polygonAmoy.id],
                    //   ["0x" + data.bytecode],
                    //   wallet
                    // );
                  } else {
                    const res = await fetch("http://localhost:3001/compile", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        contractCode: ALT_CODE,
                        name: contractLabel,
                      }),
                    });

                    const data = await res.json();
                    sessionStorage.setItem(
                      "projects",
                      JSON.stringify(projects)
                    );
                    sessionStorage.setItem("nodes", JSON.stringify(nodes));
                    sessionStorage.setItem(
                      "appSettings",
                      JSON.stringify(appSettings)
                    );
                    toast({
                      title: "Deploy Contract (2/3)",
                      description:
                        "Deploying " +
                        contractLabel +
                        ".sol on " +
                        idToChain[appSettings.node.data.chainId].name,
                    });
                    await deployContract(
                      evmUserAddress,
                      appSettings.node.data.chainId,
                      "0x" + data.bytecode,
                      wallet
                    );

                    // await deployContracts(
                    //   evmUserAddress,
                    //   [polygonAmoy.id],
                    //   ["0x" + data.bytecode],
                    //   wallet
                    // );
                  }
                } catch (err) {
                  console.log(err);
                }
              } else {
                sessionStorage.setItem("projects", JSON.stringify(projects));
                sessionStorage.setItem("nodes", JSON.stringify(nodes));
                sessionStorage.setItem(
                  "appSettings",
                  JSON.stringify({
                    open: true,
                    node: null,
                  })
                );
                sessionStorage.setItem("currentExecution", "0");
                const firstNode = nodes[0];
                try {
                  // TODO: Replace local url
                  const res = await fetch("http://localhost:3001/compile", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      contractCode: firstNode.data.code,
                      name: firstNode.data.label,
                    }),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    console.log("Success");
                    console.log(data);

                    await deployContract(
                      evmUserAddress,
                      firstNode.data.chainId,
                      "0x" + data.bytecode,
                      wallet
                    );

                    // await deployContracts(
                    //   evmUserAddress,
                    //   [polygonAmoy.id],
                    //   ["0x" + data.bytecode],
                    //   wallet
                    // );
                  } else {
                    const res = await fetch("http://localhost:3001/compile", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        contractCode: ALT_CODE,
                        name: firstNode.data.label,
                      }),
                    });

                    const data = await res.json();
                    await deployContract(
                      evmUserAddress,
                      firstNode.data.chainId,
                      "0x" + data.bytecode,
                      wallet
                    );

                    // await deployContracts(
                    //   evmUserAddress,
                    //   [polygonAmoy.id],
                    //   ["0x" + data.bytecode],
                    //   wallet
                    // );
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }}
          >
            {`${
              cannotDeploy
                ? "Insufficient Balance"
                : `Deploy ${
                    selectedContract && appSettings.node
                      ? `${appSettings.node.data.label}.sol`
                      : "All"
                  }`
            } `}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
