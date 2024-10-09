"use client";
import Flow from "@/components/project/flow";
import { ToolBar } from "@/components/project/tool-bar";
import { useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
const initNodes = [
  {
    id: "1",
    type: "custom",
    data: { label: "hello" },
    position: { x: 0, y: 50 },
  },
  {
    id: "2",
    type: "custom",
    data: { label: "jeez" },
    position: { x: -200, y: 200 },
  },
  {
    id: "3",
    type: "custom",
    data: { label: "bye" },
    position: { x: 200, y: 200 },
  },
];

const initEdges = [
  {
    id: "e1-2",
    type: "custom",
    source: "1",
    target: "2",
  },
  {
    id: "e1-3",
    type: "custom",
    source: "1",
    target: "3",
  },
];
export default function Project() {
  const projects = [
    {
      id: 1,
      projectId: "dckadtgfjert",
      name: "Chainlink Protocol x Chiliz Chain",
    },
    {
      id: 2,
      projectId: "ackaddffaflo",
      name: "Base and Arbitrum using Hyperlane",
    },
    {
      id: 3,
      projectId: "xxxxckadtgdrt",
      name: "SKALE Network x Chainlink Protocol",
    },
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const onAddNode = useCallback(() => {
    setNodes((nodes) => [
      ...nodes,
      {
        id: (nodes.length + 1).toString(),
        type: "custom",
        data: { label: "new" },
        position: { x: 0, y: 100 },
      },
    ]);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="w-full flex-1">
        <Flow
          nodes={nodes}
          edges={edges}
          setEdges={setEdges}
          setNodes={setNodes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
      </div>
      <div className="fixed top-0 left-0 right-0 select-none ">
        <div className="flex justify-center">
          <p className="text-center 2xl:text-lg text-sm font-semibold py-2 px-4  bg-secondary  bg-black dark:text-primary text-primary rounded-b-lg">
            {projects[0].name}
          </p>
        </div>
      </div>
      <ToolBar onAddNode={onAddNode} />
    </div>
  );
}
