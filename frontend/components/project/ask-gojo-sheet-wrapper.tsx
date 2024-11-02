import { XMTPProvider } from "@xmtp/react-sdk";
import AskGojoSheet from "./ask-gojo-sheet";
import { Node } from "@/lib/type";

export default function AskGojoSheetWrapper({
  id,
  onAddNode,
  nodes,
}: {
  id: string;
  onAddNode: (data: { label: string; chainId: number; code: string }) => void;

  nodes: Node[];
}) {
  return (
    <XMTPProvider>
      <AskGojoSheet id={id} onAddNode={onAddNode} nodes={nodes} />
    </XMTPProvider>
  );
}
