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
import CreateNodeModal from "./create-node-modal";
import AskGojoSheet from "./ask-gojo-sheet";
import ExportModal from "./export-modal";
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
  const [openCreateNodeModal, setOpenCreateNodeModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [openAskGojoSheet, setOpenAskGojoSheet] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);

  const onAddNode = useCallback(
    (data: { label: string; chain: { name: string; image: string } }) => {
      setNodeIds((prev) => {
        console.log("TRUgggered");
        setNodes((nodes) => [
          ...nodes,
          {
            id: prev.toString(),
            type: "custom",
            data: {
              ...data,
              address: "0x0000000000000000000000000000000000000000",
            },
            position: { x: 0, y: 100 },
          },
        ]);
        return prev + 1;
      });
    },
    []
  );

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
          <p className="text-center 2xl:text-lg text-sm font-semibold py-2 px-4  bg-gray-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-300 rounded-b-lg">
            {projects[0].name}
          </p>
        </div>
      </div>
      <ToolBar
        setOpenCreateNodeModal={setOpenCreateNodeModal}
        setOpenAskGojoSheet={setOpenAskGojoSheet}
        setOpenExportModal={setOpenExportModal}
      />
      <CreateNodeModal
        onAddNode={onAddNode}
        open={openCreateNodeModal}
        setOpen={setOpenCreateNodeModal}
      />
      <ExportModal open={openExportModal} setOpen={setOpenExportModal} />
      <AskGojoSheet
        open={openAskGojoSheet}
        setOpen={setOpenAskGojoSheet}
        node={selectedNode}
      />
    </div>
  );
}
