"use client";

import { Navigation } from "./navigation";
import { ProjectsBar } from "./projects-bar";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
  uncompressedHexPointToEvmAddress,
} from "@/lib/services/kdf";
import {
  formatNearAccount,
  getChainRpcAndExplorer,
  getPublicClient,
  shortenAddress,
} from "@/lib/utils";
import {
  GOJO_CONTRACT,
  MPC_CONTRACT,
  DERIVATION_PATH,
  idToChain,
} from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ethereum } from "@/lib/services/ethereum";
import { useEnvironmentStore } from "../context";
import { formatEther, formatUnits } from "viem";
import { useToast } from "@/hooks/use-toast";
import * as nearAPI from "near-api-js";
import { baseSepolia, polygonAmoy, sepolia } from "viem/chains";
import { IconArrowUpRight } from "@tabler/icons-react";
import { deployContract } from "@/lib/alt/deployContract";
import { ethers } from "ethers";
import ConvertGojoModal from "./convert-gojo-modal";
import { Wallet } from "@/lib/services/near-wallet";
import { deployContracts } from "@/lib/alt/deployContracts";
import { Node } from "@/lib/type";
import { ToastAction } from "../ui/toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    setBalance,
    balance,
    nearConnection,
    setNearConnection,
    setAccounts,
    userAccount,
    wallet,
    signedAccountId,
    setSignedAccountId,
    evmUserAddress,
    setEvmUserAddress,
    setBalances,
    setGojoNearConnection,
    projects,
    setProjects,
    setCreateProjectInitNodes,
    setNodeOpenAppSettings,
    appSettings,
  } = useEnvironmentStore((state) => state);
  const [openWalletPopover, setOpenWalletPopover] = useState<boolean>(false);
  const [openConvertGojoModal, setOpenConvertGojoModal] = useState(false);
  const [signedTransaction, setSignedTransaction] = useState<string>("");
  const [transactions, setTransactions] = useState<string[]>([]);
  const [projectExists, setProjectExists] = useState<boolean>(false);
  const [reloaded, setReloaded] = useState(false);
  const [envSet, setEnvSet] = useState(false);
  const pathName = usePathname();
  const [projectNodes, setProjectNodes] = useState<Node[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const signOut = () => {
    wallet.signOut();
  };
  useEffect(() => {
    // special case for web wallet that reload the whole page
    if (reloaded && evmUserAddress && envSet) signTransaction();
    async function signTransaction() {
      try {
        const {
          big_r,
          s: S,
          recovery_id,
        } = await wallet.getTransactionResult(transactions[0]);
        console.log("MPC Signature components:", { big_r, S, recovery_id });
        console.log("Expected MPC address:", evmUserAddress);
        const { rpcUrl, blockExplorer } = getChainRpcAndExplorer(
          polygonAmoy.id
        );
        // Get the transaction details
        const Eth = new Ethereum(rpcUrl, polygonAmoy.id);
        const signedTransaction =
          await Eth.reconstructSignatureFromLocalSession(
            big_r,
            S,
            recovery_id,
            evmUserAddress
          );
        console.log("Signed Transaction");
        console.log(signedTransaction);
        removeUrlParams();
        toast({
          title: "Deploy Contract (3/4)",
          description:
            "Relaying Transaction to " +
            idToChain[
              appSettings.node ? appSettings.node.data.chainId : sepolia.id
            ].name,
        });
        const txHash = await Eth.relayTransaction(signedTransaction);
        console.log("Transaction hash");
        console.log(blockExplorer + "/tx/" + txHash);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash as string);
        if (receipt && receipt.contractAddress) {
          console.log("Deployed Contract Address");
          console.log(receipt.contractAddress);
          toast({
            title: "Deploy Contract (4/4)",
            description:
              "Deployed " +
              (appSettings.node
                ? appSettings.node.data.label +
                  ".sol in " +
                  idToChain[appSettings.node.data.chainId].name
                : "SmartContract.sol in Sepolia"),
            action: (
              <ToastAction
                onClick={() => {
                  window.open(blockExplorer + "/tx/" + txHash, "_blank");
                }}
                altText="View Transaction"
              >
                View Tx
              </ToastAction>
            ),
          });
          const modifiedNodes: Node[] = [];
          projectNodes.forEach((currentNode) => {
            if (appSettings.node?.id == currentNode.id) {
              modifiedNodes.push({
                ...currentNode,
                data: {
                  ...currentNode.data,
                  address: receipt.contractAddress as string,
                },
              });
            } else modifiedNodes.push(currentNode);
          });
          setCreateProjectInitNodes(modifiedNodes);
        }
      } catch (e) {
        setCreateProjectInitNodes(projectNodes);
        console.log(e);
      }
    }
  }, [reloaded, evmUserAddress, envSet]);

  function removeUrlParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete("transactionHashes");
    window.history.replaceState({}, document.title, url);
  }

  useEffect(() => {
    wallet.startUp(setSignedAccountId);

    // gojoW
    const txHash = new URLSearchParams(window.location.search).get(
      "transactionHashes"
    );
    if (txHash) {
      setTransactions(txHash.split(","));
      setReloaded(true);
    }
  }, []);

  useEffect(() => {
    if (nearConnection == null)
      (async function () {
        const { keyStores } = nearAPI;
        const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
        const gojoKeyStore = new keyStores.InMemoryKeyStore();
        const PRIVATE_KEY = process.env
          .NEXT_PUBLIC_GOJO_PRIVATE_KEY as `ed25519:${string}`;
        const gojoKeyPair = nearAPI.KeyPair.fromString(PRIVATE_KEY);
        await myKeyStore.setKey(
          "testnet",
          "gojo-protocol.testnet",
          gojoKeyPair
        );

        const { connect } = nearAPI;

        const connectionConfig = {
          networkId: "testnet",
          keyStore: myKeyStore,
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://testnet.mynearwallet.com/",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://testnet.nearblocks.io",
        };
        const gojoNearConnectionConfig = {
          networkId: "testnet",
          keystore: gojoKeyStore,
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://testnet.mynearwallet.com/",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://testnet.nearblocks.io",
        };
        setNearConnection(await connect(connectionConfig));
        setGojoNearConnection(await connect(gojoNearConnectionConfig));
      })();
  }, [nearConnection]);

  useEffect(() => {
    if (signedAccountId && wallet && nearConnection) {
      (async function () {
        const tempBalance = await wallet.getBalance(signedAccountId);
        setBalance(tempBalance.toString());

        setAccounts(
          await nearConnection.account(GOJO_CONTRACT),
          await nearConnection.account(signedAccountId)
        );
        const publicKey = await deriveChildPublicKey(
          najPublicKeyStrToUncompressedHexPoint(),
          signedAccountId,
          DERIVATION_PATH
        );
        const address = uncompressedHexPointToEvmAddress(publicKey);
        setEvmUserAddress(address);
        const ethBalance = formatEther(
          await getPublicClient(sepolia.id).getBalance({
            address: address as `0x${string}`,
          })
        );
        const polBalance = formatEther(
          await getPublicClient(polygonAmoy.id).getBalance({
            address: address as `0x${string}`,
          })
        );
        const baseBalance = formatEther(
          await getPublicClient(baseSepolia.id).getBalance({
            address: address as `0x${string}`,
          })
        );
        console.log({ ethBalance, polBalance, baseBalance });
        setBalances(ethBalance, polBalance, baseBalance);
      })();
    } else {
      const tempProjects = JSON.parse(
        sessionStorage.getItem("projects") || "[]"
      );
      const tempNodes = JSON.parse(sessionStorage.getItem("nodes") || "{}");
      const appSettings = JSON.parse(
        sessionStorage.getItem("appSettings") || "{}"
      );
      console.log("Retreived values");
      console.log(tempProjects);
      console.log(tempNodes);
      console.log(appSettings);

      if (pathName !== "/") {
        const projectId =
          pathName.split("/").length == 3
            ? pathName.split("/")[2]
            : "100000000";
        console.log("Pathname split");
        console.log(pathName.split("/"));
        console.log(projectId);
        // if (tempProjects.length < parseInt(projectId)) {
        //   if (!signedAccountId)
        //     toast({
        //       title: "Wallet disconnected",
        //       description: "Please connect your wallet again",
        //     });
        //   else if (!wallet)
        //     toast({
        //       title: "Wallet not configured",
        //       description: "Reach out to the developer to fix the issue",
        //     });
        //   else
        //     toast({
        //       title: "Connection error",
        //       description: "Please try again",
        //     });
        //   router.push("/");
        // } else {
        setProjects(tempProjects);
        if (tempNodes.length > 0) setProjectNodes(tempNodes);
        setNodeOpenAppSettings(appSettings);
        setEnvSet(true);
        // }
      }
    }
  }, [signedAccountId, nearConnection]);

  useEffect(() => {
    console.log(pathName);

    if (pathName.startsWith("/project")) {
      const projectId = pathName.split("/")[2];
      console.log(projectId);
      console.log(projects.length);

      if (parseInt(projectId) > projects.length) {
        console.log("Redirecting");
        router.push("/");
      } else if (!projectExists) {
        // Ensure `setProjectExists` is only called if necessary
        setProjectExists(true);
      }
    }
  }, [pathName, projects.length, projectExists]);

  // return (
  //   <div className="h-screen w-screen select-text">
  //     {children}
  //     <ProjectsBar />
  //     <div className="fixed bottom-0 left-0 right-0 z-50">
  //       <div className="flex justify-center">
  //         <Navigation />
  //       </div>
  //     </div>
  //   </div>
  // );

  // async function sendEvmTransaction(bytecode: string) {
  //   console.log("🏗️ Creating transaction");

  //   const { transaction, payload } = await ETH_CLIENT.createDeploymentPayload(
  //     evmUserAddress,
  //     0,
  //     "0x" + bytecode,
  //     []
  //   );
  //   console.log(
  //     `🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`
  //   );
  //   try {
  //     // const { big_r, s, recovery_id } = await ETH_CLIENT.requestSignatureToMPC(
  //     //   wallet,
  //     //   MPC_CONTRACT,
  //     //   DERIVATION_PATH,
  //     //   payload
  //     // );
  //     // const _signedTransaction = await ETH_CLIENT.reconstructSignature(
  //     //   big_r,
  //     //   s,
  //     //   recovery_id,
  //     //   transaction
  //     // );

  //     setSignedTransaction(_signedTransaction);
  //     console.log(
  //       `✅ Signed payload ready to be relayed to the Ethereum network`
  //     );

  //     // try {
  //     //   const txHash = await ETH_CLIENT.relayTransaction(_signedTransaction);
  //     //   console.log("Transction Success");
  //     //   console.log(`https://sepolia.etherscan.io/tx/${txHash}`);
  //     // } catch (e) {
  //     //   console.log(`❌ Error: ${JSON.stringify(e)}`);
  //     // }
  //   } catch (e: any) {
  //     console.log(`❌ Error: ${e.message}`);
  //     // setLoading(false);
  //   }
  // }

  return nearConnection != null ||
    (pathName.startsWith("/project") && projectExists) ? (
    <div className="h-screen w-screen select-text">
      {children}
      <ProjectsBar />
      {signedAccountId && (
        <>
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="flex justify-center">
              <Navigation />
            </div>
          </div>
          <div className="fixed top-4 right-4 z-50">
            <div className="flex justify-center items-center  rounded-lg bg-neutral-900 border">
              <div
                className="flex items-center space-x-2 cursor-pointer hover:bg-secondary pr-3 py-0 border group hover:border-white rounded-l-lg"
                onClick={() => {
                  setOpenConvertGojoModal(true);
                }}
              >
                <Image
                  src={"/logo-nouns.png"}
                  width={30}
                  height={30}
                  alt="avatar"
                  className="rounded-full my-2 ml-4"
                />
                <p className="select-none mr-4">
                  {parseFloat(formatUnits(BigInt("0"), 25)).toFixed(2)}{" "}
                </p>
                <Separator
                  orientation="vertical"
                  className="h-[44px] group-hover:bg-white "
                />
                <Image
                  src={"/near.png"}
                  width={30}
                  height={30}
                  alt="avatar"
                  className="rounded-full my-2 ml-4 "
                />
                <p className="select-none mr-4">
                  {parseFloat(balance).toFixed(2)}{" "}
                </p>
              </div>
              <Popover
                open={openWalletPopover}
                onOpenChange={setOpenWalletPopover}
              >
                <PopoverTrigger asChild>
                  <Card className="bg-neutral-900 cursor-pointer  cursor-pointer select-none hover:bg-secondary group hover:border-white rounded-r-lg rounded-l-none">
                    <CardContent className="flex space-x-2 py-0 px-6 items-center focus-visible:ring-none">
                      <img
                        src={`https://noun-api.com/beta/pfp?name=${signedAccountId}`}
                        width={30}
                        height={30}
                        alt="nouns_pfp"
                        className="rounded-full my-2 "
                      />
                      <p className="pr-1">
                        {formatNearAccount(signedAccountId)}
                      </p>
                    </CardContent>
                  </Card>
                </PopoverTrigger>
                <PopoverContent className="bg-neutral-900 w-[205px] pt-0">
                  <div className="flex flex-col ">
                    <Button
                      variant={"ghost"}
                      onClick={async () => {
                        window.open(
                          "https://sepolia.etherscan.io/address/" +
                            evmUserAddress,
                          "_blank"
                        );

                        try {
                          const res = await fetch(
                            "http://localhost:3001/compile",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                contractCode: ` pragma solidity ^0.8.0;

                        contract Counter {
                            uint256 public count;

                            event CountChanged(uint256 newCount);

                            constructor() {
                                count = 0;
                            }

                            function increment() public {
                                count += 1;
                                emit CountChanged(count);
                            }

                            function decrement() public {
                                require(count > 0, "Counter: count can't go below zero");
                                count -= 1;
                                emit CountChanged(count);
                            }

                            function getCount() public view returns (uint256) {
                                return count;
                            }
                        }`,
                                name: "Gabriel",
                              }),
                            }
                          );

                          const data = await res.json();

                          if (res.ok) {
                            console.log("Success");
                            console.log(data);
                            // await sendEvmTransaction(data.bytecode);

                            await deployContract(
                              evmUserAddress,
                              polygonAmoy.id,
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
                            console.log("Unknown error occurred");
                          }
                        } catch (err) {
                          console.log(err);
                          console.log([
                            "Network error: " + JSON.stringify(err),
                          ]);
                        }
                      }}
                      className="flex space-x-2 items-center justify-center mt-0 hover:bg-transparent py-0"
                    >
                      {evmUserAddress == "" ? (
                        <div className="spinner"></div>
                      ) : (
                        <>
                          <Image
                            src="/chains/eth.png"
                            width={20}
                            height={20}
                            alt="eth"
                          />
                          <p>{shortenAddress(evmUserAddress)}</p>
                          <IconArrowUpRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant={"secondary"}
                      onClick={() => {
                        signOut();
                        setOpenWalletPopover(false);
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <ConvertGojoModal
                open={openConvertGojoModal}
                setOpen={setOpenConvertGojoModal}
              />
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen w-screen space-y-4">
      <Image src="/loading.gif" width={200} height={200} alt="loading" />
      <p className="text-xl">Loading</p>
    </div>
  );
}
