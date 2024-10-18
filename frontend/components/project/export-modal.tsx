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
import { Input } from "../ui/input";

export default function ExportModal({
  open,
  setOpen,
  name,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  name: string;
}) {
  const [repos, setRepos] = useState<any[]>([]);
  const [newRepoName, setNewRepoName] = useState("");

  const chains = [
    { name: "SKALE", chainId: 69, image: "/chains/skale.png" },
    { name: "Neon EVM", chainId: 21, image: "/chains/neon.png" },
    { name: "Gnosis Chain", chainId: 33, image: "/chains/gnosis.png" },
    { name: "Zircuit", chainId: 4423, image: "/chains/zircuit.png" },
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
              <p className="text-center font-medium">{name}</p>
              <Separator />
              <div className="flex flex-col space-y-2">
                <Label htmlFor="label" className="text-sm font-medium">
                  AI Agents Used
                </Label>
                <div className="flex space-x-2">
                  {chains.map((c, idx) => (
                    <Image
                      src={c.image}
                      alt="chain"
                      width={30}
                      height={30}
                      key={idx}
                    />
                  ))}
                </div>
                <Label
                  htmlFor="label"
                  className="text-xs text-muted-foreground"
                >
                  You pay royalty for all the AI agents used in the app.
                </Label>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="label" className="text-sm font-medium">
                  Intellectual Property Fee
                </Label>
                <div className="flex space-x-2 items-center">
                  <p>4</p>
                  <Image
                    src="/chains/story.png"
                    alt="chain"
                    width={20}
                    height={20}
                  />
                  <p>IP</p>
                </div>
                <Label
                  htmlFor="label"
                  className="text-xs text-muted-foreground"
                >
                  This fee is used to incentivize the code contributors.
                </Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant={"ghost"}
            onClick={() => {
              setOpen(false);
            }}
          >
            Go Back
          </Button>
          <Button onClick={() => {}} className="text-sm font-medium">
            Purchase App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
