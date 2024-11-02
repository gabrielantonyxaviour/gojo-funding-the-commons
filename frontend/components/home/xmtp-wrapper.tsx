import Home from "@/components/home";
import { XMTPProvider } from "@xmtp/react-sdk";

export default function XmtpWrapper() {
  return (
    <XMTPProvider>
      <Home />
    </XMTPProvider>
  );
}
