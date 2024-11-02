import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Node } from "@/lib/type";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { chains, idToChain } from "@/lib/constants";
import { CodeBlockComponent } from "./code-block";
import { useEnvironmentStore } from "../context";

export default function ViewCodeModal({ nodes }: { nodes: Node[] }) {
  const { viewCodeNodeId, setViewCodeNodeId } = useEnvironmentStore(
    (store) => store
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (viewCodeNodeId) {
      setSelectedNode(nodes.find((node) => node.id === viewCodeNodeId) || null);
    }
  }, [viewCodeNodeId]);
  return (
    <Dialog
      open={viewCodeNodeId != ""}
      onOpenChange={(e) => {
        if (!e) setViewCodeNodeId("");
      }}
    >
      <DialogContent className="sm:max-w-[750px]">
        {selectedNode == null ? (
          <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
            <Image src="/loading.gif" width={200} height={200} alt="loading" />
            <p className="text-xl">Loading</p>
          </div>
        ) : (
          <>
            <DialogHeader className="w-full">
              <DialogTitle>{selectedNode.data.label}.sol</DialogTitle>
            </DialogHeader>

            <Separator />
            <CodeBlockComponent solidityCode={selectedNode.data.code} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
