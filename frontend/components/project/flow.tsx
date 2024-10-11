"use client";
import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";

import { useTheme } from "next-themes";
import CustomNode from "./custom-node";
import CustomEdge from "./custom-edge";
import { FlowProps, Node } from "@/lib/type";
import CustomConnectionLine from "./connection-line";
import { useToast } from "@/hooks/use-toast";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const nodeClassName = (node: any) => node.type;

export default function Flow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  setNodeIds,
  setEdgeIds,
  setOpenCreateEdgeModal,
}: FlowProps) {
  const { theme } = useTheme();
  const { getNode } = useReactFlow();
  const { toast } = useToast();
  const onConnect = useCallback((params: any) => {
    const { source, target } = params;
    const sourceNode = getNode(source);
    const targetNode = getNode(target);
    if (sourceNode && targetNode) {
      if (
        (sourceNode as Node).data.chain.chainId !==
        (targetNode as Node).data.chain.chainId
      ) {
        toast({
          title: "Cannot Establish Connection",
          description:
            "You need a crosschain protocol to connect different chains.",
        });
        return;
      }
      setOpenCreateEdgeModal({
        ...params,
        id: "e" + source + "-" + target,
        type: "custom",
        markerEnd: { type: "arrowclosed" },
      });
      // setEdges((eds) => {
      //   console.log("ON connect");
      //   console.log("EDS");
      //   console.log(eds);

      //   return addEdge(
      //     {
      //       ...params,
      //       id: "e" + source + "-" + target,
      //       type: "custom",
      //       markerEnd: { type: "arrowclosed" },
      //     },
      //     eds
      //   );
      // });
    }
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionLineComponent={CustomConnectionLine}
      fitView
      colorMode={theme == "light" ? theme : "dark"}
    >
      <Background />
      <MiniMap zoomable pannable nodeClassName={nodeClassName} />
      <Controls />
    </ReactFlow>
  );
}
