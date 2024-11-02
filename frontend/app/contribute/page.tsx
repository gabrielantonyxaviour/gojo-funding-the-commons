"use client";
import { useEnvironmentStore } from "@/components/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GOJO_CONTRACT, THIRTY_GAS } from "@/lib/constants";
import { uploadToWalrus } from "@/lib/utils";
import { ToastAction } from "@radix-ui/react-toast";
import { IconArrowUpRight, IconChevronLeft } from "@tabler/icons-react";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ContributePage() {
  const agents = [
    {
      id: 1,
      name: "Chainlink",
      image: "/agents/chainlink.jpg",
    },
    {
      id: 2,
      name: "Sign Protocol",
      image: "/agents/sign.jpg",
    },
    {
      id: 3,
      name: "LayerZero",
      image: "/agents/layerzero.png",
    },
  ];
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [walrusBlobId, setWalrusBlobId] = useState<string | null>(null);
  const [walrusUploading, setWalrusUploading] = useState<boolean>(false);
  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const { wallet } = useEnvironmentStore((store) => store);
  // const { wallets } = useWallets();
  const { toast } = useToast();

  useEffect(() => {
    const txHash = new URLSearchParams(window.location.search).get(
      "transactionHashes"
    );
    if (txHash) {
      toast({
        title: "Transaction Success!",
        description:
          "Resource Contributed to " + agents[selectedAgent - 1].name,
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
      setTransactionPending(false);
    }
  }, []);

  return (
    <div className="h-full flex flex-col justify-center w-[650px] mx-auto">
      <div className="flex justify-between">
        <div>
          <p className="text-2xl text-left">Contribute</p>
          <p className="text-left text-sm font-light text-muted-foreground pb-12">
            Upload your code to the Gojo Network and earn <br /> royalties from
            users.
          </p>
        </div>

        {selectedAgent != 0 && (
          <div>
            <Image
              src={agents[selectedAgent - 1].image}
              width={80}
              height={80}
              alt={agents[selectedAgent - 1].name}
              className={
                agents[selectedAgent - 1].id == 1
                  ? "bg-stone-300 rounded-full border-[1px] border-white"
                  : "bg-transparent rounded-full border-[1px] border-white"
              }
            />
          </div>
        )}
      </div>

      {selectedAgent == 0 ? (
        <div className="grid grid-cols-3 gap-4 mx-auto">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className=" hover:border-white hover:scale-110 transition duration-150 ease-in-out cursor-pointer"
              onClick={() => [setSelectedAgent(agent.id)]}
            >
              <CardContent className="px-0 pb-2">
                <Image
                  src={agent.image}
                  width={200}
                  height={200}
                  alt={agent.name}
                  className={"bg-white rounded-t-lg"}
                />
                <p className="text-center pt-2">{agent.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          {file != null ? (
            walrusUploading ? (
              <div className="w-full flex justify-center items-center h-[100px] border border-dashed border-secondary rounded-lg">
                <Image
                  src="/loading.gif"
                  width={100}
                  height={100}
                  alt="loading"
                />
                <p className="text-center text-sm pt-6 text-muted-foreground">
                  Uploading to Walrus
                </p>
              </div>
            ) : (
              <div className="relative group w-full">
                <div
                  className="flex flex-col justify-center items-center w-full h-[100px] border border-dashed border-secondary cursor-pointer rounded-lg transition-opacity duration-300 ease-in-out group-hover:opacity-50"
                  onClick={() => {
                    setFile(null);
                    setWalrusBlobId(null);
                  }}
                >
                  <p className="text-sm text-muted-foreground text-center">
                    {walrusBlobId != null && "Uploaded "} {file.name}
                    {walrusBlobId != null && " to Walrus!"}
                  </p>
                  {walrusBlobId != null && (
                    <p className="text-sm text-muted-foreground text-center">
                      Blob Id
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center">
                    {walrusBlobId}
                  </p>
                </div>
                <div
                  className="cursor-pointer absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                  onClick={() => {
                    setFile(null);
                  }}
                >
                  <Trash className="w-8 h-8 " />
                </div>
              </div>
            )
          ) : (
            <label
              htmlFor="solidityUpload"
              className="flex justify-center items-center w-full h-[100px] border border-dashed border-secondary cursor-pointer"
            >
              <input
                id="solidityUpload"
                type="file"
                accept=".sol"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0]; // Get the first selected file
                  if (file) {
                    setFile(file); // Set the selected file
                  }
                }}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground text-center">
                Click here to upload your code <br /> (only .sol files)
              </p>
            </label>
          )}
        </div>
      )}
      {selectedAgent != 0 && (
        <div className="flex justify-between py-4">
          <Button
            variant={"ghost"}
            onClick={() => {
              setSelectedAgent(0);
            }}
          >
            <IconChevronLeft className="h-5 w-5" />
            <p>Go Back</p>
          </Button>
          <div className="flex space-x-2">
            {walrusBlobId != null && (
              <Button
                variant={"ghost"}
                className="text-stone-300"
                onClick={() => {
                  window.open(
                    "https://aggregator-devnet.walrus.space/v1/" + walrusBlobId,
                    "_blank"
                  );
                }}
              >
                <p>View in Walrus</p>
                <IconArrowUpRight className="h-5 w-5" />
              </Button>
            )}
            <Button
              disabled={
                file == null ||
                walrusUploading ||
                transactionPending ||
                txHash.length > 0
              }
              onClick={async () => {
                if (file == null) return;

                try {
                  toast({
                    title: "Create Resource (1/3)",
                    description: " Uploading " + file.name + " to Walrus...",
                  });
                  setWalrusUploading(true);
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
                    title: "Create Resource (2/3)",
                    description:
                      "Uploaded " + file.name + " to Walrus. Sending Tx...",
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
                        View Tx <IconArrowUpRight size={16} />
                      </ToastAction>
                    ),
                  });

                  setTransactionPending(true);

                  const transaction = await wallet.callMethod({
                    contractId: GOJO_CONTRACT,
                    method: "create_resource",
                    args: {
                      agent_id: selectedAgent - 1,
                      resource_walrus_hash: tempBlobId,
                    },
                    deposit: "0",
                    gas: THIRTY_GAS,
                  });
                  if (transaction) {
                    toast({
                      title: "Create Resource (2/3)",
                      description:
                        "Resource Contributed to " +
                        agents[selectedAgent - 1].name,
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
                      title: "Create Resource (2/3)",
                      description:
                        "Resource Contributed to " +
                        agents[selectedAgent - 1].name,
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
                } catch (e) {
                  console.log(e);
                  if (transactionPending) {
                    toast({
                      title: "Transaction Failed or Rejected",
                      description:
                        "Please try again. If issue persists, contact @gabrielaxyy in Telegram",
                      variant: "destructive",
                    });
                  }

                  if (walrusUploading) {
                    toast({
                      title: "Walrus Upload Failed",
                      description:
                        "Please try again. If issue persists, contact @gabrielaxyy in Telegram",
                      variant: "destructive",
                    });
                  }
                } finally {
                  setTransactionPending(false);
                  setWalrusBlobId("");
                  setWalrusUploading(false);
                  setFile(null);
                }
              }}
            >
              {transactionPending
                ? "Pending Tx ..."
                : txHash.length > 0
                ? "Success"
                : walrusUploading
                ? "Uploading ..."
                : "Contribute Code"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
