import React, { memo, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { IconRobot, IconTrash, IconWand } from "@tabler/icons-react";
function CustomNode({ id, data }: any) {
  const { getNodes, setNodes } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  return (
    <Card
      className="border-[2px] border-secondary"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="w-[200px] h-[200px] relative">
        {hovered && (
          <motion.div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="px-1  whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute top-16 -translate-y-1/2 -right-8 w-fit 2xl:text-md text-xs flex flex-col"
          >
            <Button variant={"ghost"} className="p-1 m-0 hover:text-blue-500">
              <IconWand className="w-4 h-4 m-0 p-0" />
            </Button>
            <Button variant={"ghost"} className="p-1 m-0 hover:text-yellow-500">
              <IconRobot className="w-4 h-4 m-0 p-0" />
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
        <Handle
          type="target"
          position={Position.Top}
          className="w-16 h-3 rounded-t-md -top-1.5"
        />
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 h-3 rounded-b-md -bottom-1.5"
      />
    </Card>
  );
}

export default memo(CustomNode);
