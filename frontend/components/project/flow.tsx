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
  const { screenToFlowPosition } = useReactFlow();
  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    []
  );

  const onConnectEnd = useCallback(
    (event: any, connectionState: any) => {
      if (!connectionState.isValid) {
        console.log(nodes);

        // Update nodeIds with functional setState to ensure it uses the latest value
        setNodeIds((prevNodeIds) => {
          const id = (prevNodeIds + 1).toString();

          const { clientX, clientY } =
            "changedTouches" in event ? event.changedTouches[0] : event;

          const newNode = {
            id,
            position: screenToFlowPosition({
              x: clientX,
              y: clientY,
            }),
            type: "custom",
            data: {
              label: "new",
            },
          };

          // Add new node and edge using updated ID
          setNodes((nds) => [...nds, newNode]);
          setEdges((eds) => [
            ...eds,
            {
              id,
              type: "custom",
              source: connectionState.fromNode.id,
              target: id,
            },
          ]);

          return prevNodeIds + 1; // Return the updated nodeId for future renders
        });
      }
    },
    [screenToFlowPosition] // Dependencies
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
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
