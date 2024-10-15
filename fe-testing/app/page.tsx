"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WalletWrapper from "@/components/wallet-wrapper";
import {
  Client,
  useStreamMessages,
  useClient,
  useMessages,
  useConversations,
  useCanMessage,
  useSendMessage,
  useStartConversation,
} from "@xmtp/react-sdk";
import { FormEvent, useCallback, useState } from "react";
import { isAddress } from "viem";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
export default function HomePage() {
  const [peerAddress, setPeerAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const { sendMessage } = useSendMessage();
  const { conversations } = useConversations();

  const { canMessage } = useCanMessage();

  const handleCheckAddress = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isAddress(peerAddress)) {
        setIsLoading(true);
        setIsOnNetwork(await canMessage(peerAddress));
        setIsLoading(false);
      } else {
        setIsOnNetwork(false);
      }
    },
    [peerAddress]
  );

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("sending message");
      if (peerAddress && isAddress(peerAddress) && message) {
        setIsLoading(true);
        await sendMessage(conversations[0], message);
        setIsLoading(false);
      }
    },
    [message, peerAddress, sendMessage]
  );
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center  bg-black">
      <p>Testing XMTP</p>
      <form onSubmit={handleCheckAddress}>
        <Input
          name="addressInput"
          type="text"
          onChange={(e) => setPeerAddress(e.target.value)}
          disabled={isLoading}
        />
        <Input
          name="messageInput"
          type="text"
          onChange={(e) => setPeerAddress(e.target.value)}
          disabled={isSending}
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>
          Send Message
        </Button>
        <Button
          onClick={async () => {
            let coinbase = Coinbase.configureFromJson({
              filePath: "~/Downloads/cdp_api_key.json",
            });
            let wallet = await Wallet.create();
            console.log(`Wallet successfully created: `, wallet.toString());
          }}
        >
          Create MPC Wallet
        </Button>
      </form>
    </div>
  );
}
