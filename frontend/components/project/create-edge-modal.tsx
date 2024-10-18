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
import { Dispatch, SetStateAction, useState } from "react";
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
import { useReactFlow, addEdge } from "@xyflow/react";

export default function CreateEdgeModal({
  edgeData,
  setEdgeData,
}: {
  edgeData: any;
  setEdgeData: Dispatch<SetStateAction<any>>;
}) {
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const { setEdges } = useReactFlow();
  return (
    <Dialog
      open={edgeData != null}
      onOpenChange={(e) => {
        if (e == false) {
          setEdgeData(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="w-full">
          <DialogTitle>Setup Interaction</DialogTitle>
        </DialogHeader>

        <Separator />
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="label" className="text-sm font-medium">
              Label
            </Label>
            <Input
              id="label"
              className="text-xs h-8"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
              }}
            />
            <Label htmlFor="label" className="text-xs text-muted-foreground">
              The name by which you reference this connection.
            </Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              className="text-xs h-8"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Label htmlFor="prompt" className="text-xs text-muted-foreground">
              The AI prompt to create the connection.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant={"ghost"}
            onClick={() => {
              setLabel("");
              setPrompt("");
            }}
          >
            Reset
          </Button>
          <Button
            disabled={label == "" || prompt == ""}
            onClick={() => {
              setEdges((eds) => {
                return addEdge(
                  {
                    ...edgeData,
                    data: {
                      label: label,
                      salt: Math.floor(Math.random() * 100000000001),
                    },
                  },
                  eds
                );
              });

              setEdgeData(null);
              setLabel("");
              setPrompt("");
            }}
          >
            Add node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
