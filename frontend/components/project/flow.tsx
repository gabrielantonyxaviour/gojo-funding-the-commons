"use client";
import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";

import { useTheme } from "next-themes";
import CustomNode from "./custom-node";
import CustomEdge from "./custom-edge";
import { FlowProps } from "@/lib/type";
import CustomConnectionLine from "./connection-line";

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
}: FlowProps) {
  const { theme } = useTheme();
  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    []
  );

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
