import React, { memo, useCallback, useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import {
  IconArrowUpRight,
  IconArrowUpSquare,
  IconEye,
  IconPencil,
  IconRobot,
  IconSettings,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { idToChain } from "@/lib/constants";
import { getChainRpcAndExplorer, shortenAddress } from "@/lib/utils";
import { useEnvironmentStore } from "../context";
import UpdateNodeModal from "./update-node-modal";
import { Node } from "@/lib/type";
import { zeroAddress } from "viem";
function CustomNode(node: any) {
  const { id, data } = node;
  const { setNodes } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const { setNodeOpenAskGojo, setNodeOpenAppSettings, setViewCodeNodeId } =
    useEnvironmentStore((state) => state);

  const onChangeNode = useCallback(
    (onChangeNodeData: { nodeId: string; chainId: number; label: string }) => {
      const { nodeId, chainId, label } = onChangeNodeData;
      setNodes((nds) => {
        return nds.map((node) => {
          if (node.id == nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label,
                chainId,
                salt: Math.floor(Math.random() * 100000000001),
                address: chainId != data.chainId ? zeroAddress : data.address,
              },
            };
          } else return node;
        });
      });
    },
    []
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
            className="px-1  whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute top-[100px] -translate-y-1/2 -right-[36px] w-fit 2xl:text-md text-xs flex flex-col"
          >
            <Button
              variant={"ghost"}
              className="p-1 m-0 hover:text-yellow-500"
              onClick={() => {
                setOpenEditModal(true);
              }}
            >
              <IconPencil className="w-4 h-4 m-0 p-0" />
            </Button>
            <Button
              variant={"ghost"}
              className="p-1 m-0 hover:text-blue-500"
              onClick={() => {
                setViewCodeNodeId(id);
              }}
            >
              <IconEye className="w-4 h-4 m-0 p-0" />
            </Button>
            <Button
              variant={"ghost"}
              className="p-1 m-0 hover:text-indigo-500"
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
              className="p-1 m-0 hover:text-green-500"
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
              <p className="text-sm font-semibold">
                {data.label.length > 14
                  ? data.label.slice(0, 7) + " ... " + data.label.slice(-4)
                  : data.label}
              </p>
            </div>
            <Image
              src={idToChain[data.chainId].image}
              width={20}
              height={20}
              alt="chain"
            />
          </div>
          <Separator />
          <p className="text-sm pb-2 pt-4">Agents Used</p>
          <div className="flex justify-center space-x-2">
            <Image
              src="/agents/layerzero.png"
              width={20}
              height={20}
              alt="robot"
              className="bg-white rounded-full"
            />
            <Image
              src="/agents/chainlink.jpg"
              width={20}
              height={20}
              alt="robot"
            />
            <Image src="/agents/sign.jpg" width={20} height={20} alt="robot" />
          </div>
          <p className="text-sm pt-6 pb-1">Deployment</p>
          <p
            className={`text-muted-foreground text-xs flex items-center ${
              data.address != zeroAddress && "hover:text-white hover:scale-105"
            }`}
            onClick={() => {
              if (data.address != zeroAddress) {
                const chain = getChainRpcAndExplorer(data.chainId);
                window.open(
                  chain.blockExplorer + "/address/" + data.address,
                  "_blank"
                );
              }
            }}
          >
            {shortenAddress(data.address)}
            {data.address != zeroAddress && (
              <IconArrowUpRight className="h-4 w-4" />
            )}
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
      <UpdateNodeModal
        nodeId={id}
        initLabel={data.label}
        initChainId={data.chainId}
        open={openEditModal}
        setOpen={setOpenEditModal}
        onChangeNode={onChangeNode}
      />
    </Card>
  );
}

export default memo(CustomNode);
