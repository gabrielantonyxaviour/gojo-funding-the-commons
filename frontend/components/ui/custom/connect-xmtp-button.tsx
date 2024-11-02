import { Button } from "../button";

export default function ConnectXmtpButton({
  login,
  disabled,
}: {
  login: () => void;
  disabled: boolean;
}) {
  return (
    <Button onClick={login} className="px-12">
      Connect XMTP Client
    </Button>
  );
}
