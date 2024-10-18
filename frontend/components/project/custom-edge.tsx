import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { IconSettings, IconTrash, IconWand } from "@tabler/icons-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { shortenAddress } from "@/lib/utils";
export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: any) {
  const { setEdges, getEdge } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      <EdgeLabelRenderer>
        <Card
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="bg-neutral-300 dark:bg-neutral-800 border-[2px] border-secondary nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <CardContent className="w-[170px] h-[80px]  px-0">
            <div className="flex flex-col items-center justify-center py-2 w-full">
              <div className="flex items-center justify-center w-full px-3 pb-2 space-x-2">
                <img
                  src={`https://noun-api.com/beta/pfp?name=${data.salt}`}
                  width={20}
                  height={20}
                  alt="nouns_pfp"
                  className="rounded-full"
                />
                <p className="text-sm font-medium">{data.label}</p>
              </div>
              <Separator className="dark:bg-neutral-700 bg-neutral-400 " />
              <div className="flex justify-center space-x-3">
                <Button
                  variant={"ghost"}
                  className="p-1 m-0 hover:text-blue-500"
                  onClick={() => {
                    // setNodeOpenAskGojo({
                    //   open: true,
                    //   node,
                    // });
                  }}
                >
                  <IconWand className="w-4 h-4 m-0 p-0" />
                </Button>
                <Button
                  variant={"ghost"}
                  className="p-1 m-0 hover:text-yellow-500"
                  onClick={() => {
                    // setNodeOpenAppSettings({
                    //   open: true,
                    //   node,
                    // });
                  }}
                >
                  <IconSettings className="w-4 h-4 m-0 p-0" />
                </Button>

                <Button
                  variant={"ghost"}
                  className="p-1 m-0 hover:text-red-500"
                  onClick={() => {
                    setEdges((eds) => eds.filter((edge) => edge.id !== id));
                  }}
                >
                  <IconTrash className="w-4 h-4 m-0 p-0" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </EdgeLabelRenderer>
    </>
  );
}
