import React, { memo, useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import {
  IconRobot,
  IconSettings,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { shortenAddress } from "@/lib/utils";
import { useEnvironmentStore } from "../context";
function CustomNode(node: any) {
  const { id, data } = node;
  const { setNodes } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const { setNodeOpenAskGojo, setNodeOpenAppSettings } = useEnvironmentStore(
    (state) => state
  );

  useEffect(() => {
    console.log("Node updated");
    console.log(node);
    console.log(`https://noun-api.com/beta/pfp?name=${data.salt.toString()}`);
  }, []);
  return (
    <Card
      className="border-[2px] border-secondary"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="w-[200px] h-[200px] relative px-0">
        {hovered && (
          <motion.div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="px-1  whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute top-16 -translate-y-1/2 -right-8 w-fit 2xl:text-md text-xs flex flex-col"
          >
            <Button
              variant={"ghost"}
              className="p-1 m-0 hover:text-blue-500"
              onClick={() => {
                setNodeOpenAskGojo({
                  open: true,
                  node,
                });
              }}
            >
              <IconWand className="w-4 h-4 m-0 p-0" />
            </Button>
            <Button
              variant={"ghost"}
              className="p-1 m-0 hover:text-yellow-500"
              onClick={() => {
                setNodeOpenAppSettings({
                  open: true,
                  node,
                });
              }}
            >
              <IconSettings className="w-4 h-4 m-0 p-0" />
            </Button>

            <Button
              variant={"ghost"}
              className="p-1 m-0 hover:text-red-500"
              onClick={() => {
                setNodes((nds) => nds.filter((node) => node.id !== id));
              }}
            >
              <IconTrash className="w-4 h-4 m-0 p-0" />
            </Button>
          </motion.div>
        )}
        <div className="flex flex-col items-center justify-center py-2 w-full">
          <div className="flex items-center justify-between w-full px-3 pb-2">
            <div className="flex space-x-2">
              <img
                src={`https://noun-api.com/beta/pfp?name=${data.salt.toString()}`}
                width={20}
                height={20}
                alt="nouns_pfp"
                className="rounded-full"
              />
              <p className="text-sm font-medium">{data.label}</p>
            </div>
            <Image src={data.chain.image} width={20} height={20} alt="chain" />
          </div>
          <Separator />
          <p className="text-sm pb-2 pt-4">AI Agents</p>
          <div className="flex justify-center space-x-2">
            <Image src="/chains/neon.png" width={20} height={20} alt="robot" />
            <Image
              src="/chains/gnosis.png"
              width={20}
              height={20}
              alt="robot"
            />
            <Image src="/chains/skale.png" width={20} height={20} alt="robot" />
          </div>
          <p className="text-sm pt-6 pb-1">Deployment</p>
          <p className="text-muted-foreground">
            {shortenAddress(data.address)}
          </p>
        </div>
        <Handle
          type="target"
          position={Position.Top}
          className="w-16 h-3 rounded-t-md -top-1.5 bg-neutral-300 dark:bg-neutral-800"
        />
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 h-3 rounded-b-md -bottom-1.5 bg-neutral-300 dark:bg-neutral-800"
      />
    </Card>
  );
}

export default memo(CustomNode);
