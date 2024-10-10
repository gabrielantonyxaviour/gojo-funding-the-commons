import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { IconBrandGithub } from "@tabler/icons-react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function ExportModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [repos, setRepos] = useState<any[]>([]);
  const [newRepoName, setNewRepoName] = useState("");

  const chains = [
    { name: "SKALE", image: "/chains/skale.png" },
    { name: "Neon EVM", image: "/chains/neon.png" },
    { name: "Gnosis Chain", image: "/chains/gnosis.png" },
    { name: "Zircuit", image: "/chains/zircuit.png" },
  ];

  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedChainIndex, setSelectedChainIndex] = useState("0");
  const { data: session } = useSession();

  useEffect(() => {
    console.log(session);
  }, [session]);

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="w-full">
          <DialogTitle>Export App</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col space-y-4 w-full">
          {session == null ? (
            <div className="flex flex-col space-y-2">
              <Button
                variant={"outline"}
                onClick={() => {
                  signIn("github", {
                    redirect: false, // Prevents redirect to the next-auth sign-in page
                    callbackUrl: "/projects/dckadtgfjert", // Your callback URL
                    scope: "repo read:user", // Requesting necessary GitHub scopes
                  });
                }}
                className="flex justify-center space-x-2"
              >
                <IconBrandGithub />
                <p>Github</p>
              </Button>
              <Label
                htmlFor="label"
                className="text-xs text-muted-foreground text-center"
              >
                Connect to your Github account to export your app.
              </Label>
            </div>
          ) : (
            <>
              <div className="flex space-x-1">
                <Button
                  variant={"outline"}
                  className="flex flex-1 justify-center space-x-2"
                >
                  <Image
                    src={session.user?.image || ""}
                    width={20}
                    height={20}
                    alt="pfp"
                    className="rounded-full"
                  />
                  <p>{session.user?.name || ""}</p>
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    signOut();
                  }}
                >
                  Sign Out
                </Button>
              </div>
              <Separator />
            </>
          )}
        </div>

        {/* <DialogFooter>
          <Button
            variant={"ghost"}
            onClick={() => {
              setLabel("");
              setPrompt("");
              setSelectedChainIndex("0");
            }}
          >
            Reset
          </Button>
          <Button
            disabled={selectedChainIndex == "0" || label == "" || prompt == ""}
            onClick={() => {}}
          >
            Add node
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
