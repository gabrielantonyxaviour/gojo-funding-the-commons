import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Separator } from "../ui/separator";

import Image from "next/image";
import { GOJO_CONTRACT } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useEnvironmentStore } from "../context";
import { IconArrowRight } from "@tabler/icons-react";
import { ethers } from "ethers";

export default function ConvertGojoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [amount, setAmount] = useState(0);
  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const { wallet, signedAccountId } = useEnvironmentStore((store) => store);
  const { toast } = useToast();

  useEffect(() => {
    // const txHash = new URLSearchParams(window.location.search).get(
    //   "transactionHashes"
    // );
    // if (txHash) {
    //   const deposit = sessionStorage.getItem("deposit") || "0";
    //   toast({
    //     title: "Deposit NEAR (2/4)",
    //     description:
    //       "Transaction Success! Minting " +
    //       deposit +
    //       " $GOJO tokens. Waiting for confirmation...",
    //     action: (
    //       <ToastAction
    //         onClick={() => {
    //           window.open(
    //             "https://testnet.nearblocks.io/txns/" + txHash,
    //             "_blank"
    //           );
    //         }}
    //         altText="View Transaction"
    //       >
    //         View Tx <IconArrowUpRight size={16} />
    //       </ToastAction>
    //     ),
    //   });
    //   (async function () {
    //     const PRIVATE_KEY = process.env
    //       .NEXT_PUBLIC_GOJO_PRIVATE_KEY as `ed25519:${string}`;
    //     const ACCOUNT_ID = "benatwix.testnet";
    //     const keyPair = KeyPair.fromString(PRIVATE_KEY);
    //     const keyStore = new keyStores.InMemoryKeyStore();
    //     await keyStore.setKey("testnet", ACCOUNT_ID, keyPair);
    //     const config = {
    //       networkId: "testnet",
    //       keyStore,
    //       nodeUrl: "https://rpc.testnet.near.org",
    //       walletUrl: "https://wallet.testnet.near.org",
    //       helperUrl: "https://helper.testnet.near.org",
    //       explorerUrl: "https://explorer.testnet.near.org",
    //     };
    //     const gojoNearConnection = await connect(config);
    //     const gojoWallet = await gojoNearConnection.account(ACCOUNT_ID)!;
    //     let depositNearTransaction: any = "";
    //     try {
    //       depositNearTransaction = await gojoWallet.functionCall({
    //         contractId: GOJO_CONTRACT,
    //         methodName: "deposit_near",
    //         args: {},
    //         gas: BigInt(TWO_HUNDRED_GAS),
    //         attachedDeposit: BigInt(
    //           utils.format.parseNearAmount(deposit) || "0"
    //         ),
    //       });
    //       console.log(depositNearTransaction);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     toast({
    //       title: "Deposit NEAR (3/4)",
    //       description:
    //         "Transferring " +
    //         deposit +
    //         " $GOJO tokens to User. Waiting for confirmation...",
    //       action: (
    //         <ToastAction
    //           onClick={() => {
    //             window.open(
    //               "https://testnet.nearblocks.io/address/" + GOJO_CONTRACT,
    //               "_blank"
    //             );
    //           }}
    //           altText="View Transaction"
    //         >
    //           View Tx <IconArrowUpRight size={16} />
    //         </ToastAction>
    //       ),
    //     });
    //     let gojoTransferTransaction: any;
    //     try {
    //       gojoTransferTransaction = await gojoWallet.functionCall({
    //         contractId: GOJO_TOKEN_CONTRACT,
    //         methodName: "ft_transfer",
    //         args: {
    //           receiverId: signedAccountId,
    //           amount: ethers.utils.parseUnits(deposit, 24).toString(),
    //           memo: "",
    //         },
    //         gas: BigInt(TWO_HUNDRED_GAS),
    //         attachedDeposit: BigInt("0"),
    //       });
    //       console.log(gojoTransferTransaction);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     toast({
    //       title: "Deposit NEAR (4/4)",
    //       description:
    //         "Transaction Complete! Minted " + deposit + " $GOJO to the user.",
    //       action: (
    //         <ToastAction
    //           onClick={() => {
    //             window.open(
    //               "https://testnet.nearblocks.io/address/" +
    //                 GOJO_TOKEN_CONTRACT,
    //               "_blank"
    //             );
    //           }}
    //           altText="View Transaction"
    //         >
    //           View Tx <IconArrowUpRight size={16} />
    //         </ToastAction>
    //       ),
    //     });
    //   })();
    // }
  }, []);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogContent className="sm:max-w-[450px] select-none">
        <DialogHeader className="w-full">
          <DialogTitle>Mint $GOJO</DialogTitle>
        </DialogHeader>

        <Separator />
        <div className="flex justify-between  w-full py-8 space-x-4">
          <div className="flex flex-col justify-center items-center  space-y-2">
            <Image src={"/near.png"} width={60} height={60} alt="near" />
            <p className="font-semibold text-sm text-center">You send</p>
            <div className="flex flex-col space-y-2  items-center">
              <Input
                value={amount}
                type="number"
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={transactionPending}
                className="2xl:text-lg text-md font-medium p-4 border text-center"
              />
              <p className="text-sm font-semibold">NEAR</p>
            </div>
          </div>
          <div className="flex flex-col justify-center itemse-center">
            <IconArrowRight className="h-8 w-8" />
          </div>
          <div className="flex flex-col justify-center items-center space-y-2 ">
            <Image
              src={"/logo-nouns.png"}
              width={60}
              height={60}
              alt="near"
              className="rounded-full"
            />
            <p className="font-semibold text-sm text-center">You receive</p>
            <div className="flex flex-col space-y-2  items-center">
              <Input
                value={amount}
                type="number"
                className="2xl:text-lg text-md font-medium p-4 border border-white bg-secondary text-center"
                disabled={true}
              />
              <p className="text-sm font-semibold">GOJO</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <Button
            onClick={async () => {
              try {
                setTransactionPending(true);
                toast({
                  title: "Deposit NEAR (1/4)",
                  description:
                    "Transferring " +
                    amount +
                    " $NEAR to Protocol. Waiting for confirmation...",
                });

                sessionStorage.setItem("deposit", amount.toString());

                const nearTransferTransaction = await wallet.transfer({
                  receiverId: GOJO_CONTRACT,
                  deposit: ethers.parseUnits(amount.toString(), 24).toString(),
                });

                console.log(nearTransferTransaction);
              } catch (e) {
                console.log(e);
                setTransactionPending(false);
                toast({
                  title: "Failed to mint $GOJO",
                  description:
                    "Check logs to know more. If issue persists, contact @gabrielaxyy at tg",
                  variant: "destructive",
                });
              }
            }}
          >
            Confirm Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
