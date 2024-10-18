"use client";
import Flow from "@/components/project/flow";
import { ToolBar } from "@/components/project/tool-bar";
import { Edge, Node } from "@/lib/type";
import {
  MarkerType,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import CreateNodeModal from "./create-node-modal";
import AskGojoSheet from "./ask-gojo-sheet";
import ExportModal from "./export-modal";
import { useEnvironmentStore } from "../context";
import AppTestingSheet from "./app-testing-sheet";
import CreateEdgeModal from "./create-edge-modal";
const initNodes: Node[] = [];

const initEdges: Edge[] = [];
export default function Project({ name }: { name: string }) {
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
  const [openExportModal, setOpenExportModal] = useState(false);
  const [openCreateEdgeModal, setOpenCreateEdgeModal] = useState<any>(null);
  const { askGojo, setOpenAskGojo, appSettings, setOpenAppSettings } =
    useEnvironmentStore((state) => state);

  useEffect(() => {
    console.log("Updating ask gojo");
    console.log(askGojo);
  }, [askGojo]);

  const onAddNode = useCallback(
    (data: {
      label: string;
      chain: { name: string; chainId: number; image: string };
    }) => {
      setNodeIds((prev) => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: prev.toString(),
            type: "custom",
            data: {
              ...data,
              address: "0x0000000000000000000000000000000000000000",
              salt: Math.floor(Math.random() * 100000000001),
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
          setOpenCreateEdgeModal={setOpenCreateEdgeModal}
        />
      </div>
      <div className="fixed top-0 left-0 right-0 select-none ">
        <div className="flex justify-center">
          <p className="text-center 2xl:text-lg text-sm font-medium py-2 px-4  bg-gray-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-300 rounded-b-lg">
            {projects[0].name}
          </p>
        </div>
      </div>
      <ToolBar
        setOpenCreateNodeModal={setOpenCreateNodeModal}
        setOpenExportModal={setOpenExportModal}
      />
      <CreateNodeModal
        onAddNode={onAddNode}
        open={openCreateNodeModal}
        setOpen={setOpenCreateNodeModal}
      />
      <CreateEdgeModal
        edgeData={openCreateEdgeModal}
        setEdgeData={setOpenCreateEdgeModal}
      />
      <AppTestingSheet appTesting={appSettings} />
      <ExportModal
        open={openExportModal}
        setOpen={setOpenExportModal}
        name={name}
      />
      <AskGojoSheet askGojo={askGojo} />
    </div>
  );
}
