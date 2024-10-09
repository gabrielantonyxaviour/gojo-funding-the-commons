import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export default function Suggestions({
  setPrompt,
}: {
  setPrompt: (prompt: string) => void;
}) {
  const suggestedPrompts = [
    "Build a cross chain NFT using LayerZero",
    "Build a ETHSign Whitelist Hook Smart contract",
    "Build an enrypted IP solution for Story using Lit Protocol",
  ];
  return (
    <div className="flex flex-wrap justify-center space-x-4 gap-y-2 py-4">
      {suggestedPrompts.map((p, id) => (
        <Badge
          key={id}
          className="xl:text-sm text-xs cursor-pointer hover:scale-105 transition  ease-out duration-150 dark:bg-white bg-secondary text-black hover:bg-secondary"
          onClick={() => {
            setPrompt(p);
          }}
        >
          {p} <IconArrowUpRight></IconArrowUpRight>{" "}
        </Badge>
      ))}
    </div>
  );
}
