"use client";
import Flow from "@/components/project/flow";
import { ToolBar } from "@/components/project/tool-bar";
import { Node } from "@/lib/type";
import {
  MarkerType,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
const initNodes: Node[] = [];

const initEdges = [
  {
    id: "e1-2",
    type: "custom",
    source: "1",
    target: "2",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-3",
    type: "custom",
    source: "1",
    target: "3",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
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

  const [nodeIds, setNodeIds] = useState(0);
  const [edgeIds, setEdgeIds] = useState(0);

  const onAddNode = useCallback(() => {
    setNodeIds((prev) => {
      setNodes((nodes) => [
        ...nodes,
        {
          id: prev.toString(),
          type: "custom",
          data: { label: "new" },
          position: { x: 0, y: 100 },
        },
      ]);
      return prev + 1;
    });
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
          setNodeIds={setNodeIds}
          setEdgeIds={setEdgeIds}
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
