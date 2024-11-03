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
import DeployAppSheet from "./deploy-app-sheet";
import CreateEdgeModal from "./create-edge-modal";
import dynamic from "next/dynamic";
import { idToChain } from "@/lib/constants";
import { zeroAddress } from "viem";
import ViewCodeModal from "./view-code-modal";
import { useEnvironmentStore } from "../context";
import { useRouter } from "next/navigation";
const AskGojoSheetWrapper = dynamic(
  () => import("@/components/project/ask-gojo-sheet-wrapper"),
  {
    ssr: false,
  }
);
const initNodes: Node[] = [];

const initEdges: Edge[] = [];
export default function Project({ id }: { id: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const [isGenerated, setIsGenerated] = useState(false);
  const { projects, createProjectInitNodes, setCreateProjectInitNodes } =
    useEnvironmentStore((store) => store);
  const router = useRouter();

  const [openCreateNodeModal, setOpenCreateNodeModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [openCreateEdgeModal, setOpenCreateEdgeModal] = useState<any>(null);
  const [openViewCodeModal, setOpenViewCodeModal] = useState(false);
  const onAddNode = useCallback(
    (data: { label: string; chainId: number; code: string }) => {
      setNodes((nodes) => [
        ...nodes,
        {
          id: (nodes.length + 1).toString(),
          type: "custom",
          data: {
            ...data,
            address: zeroAddress,
            salt: Math.floor(Math.random() * 100000000001),
          },
          position: { x: 0, y: 100 },
        },
      ]);
    },
    []
  );

  const onChangeNode = useCallback(
    (data: {
      nodeId: string;
      chainId: number;
      label: string;
      code: string;
    }) => {
      const { nodeId, chainId, label, code } = data;
      const modifiedNodes: Node[] = [];
      nodes.forEach((node) => {
        if (node.id == nodeId) {
          modifiedNodes.push({
            ...node,
            data: {
              label,
              chainId: chainId,
              code,
              salt: Math.floor(Math.random() * 100000000001),
              address: zeroAddress,
            },
          });
        } else modifiedNodes.push(node);
      });
      setNodes(modifiedNodes);
    },
    []
  );
  const solidityCode = `
  pragma solidity ^0.8.0;

  contract MyToken {
      string public name = "My Token";
      string public symbol = "MTK";
      uint256 public totalSupply = 1000000;

      mapping(address => uint256) public balanceOf;

      constructor() {
          balanceOf[msg.sender] = totalSupply;
      }

      function transfer(address to, uint256 amount) public {
          require(balanceOf[msg.sender] >= amount, "Insufficient balance");
          balanceOf[msg.sender] -= amount;
          balanceOf[to] += amount;
      }
  }
`;

  useEffect(() => {
    if (createProjectInitNodes.length > 0) {
      setNodes(createProjectInitNodes);
      setCreateProjectInitNodes([]);
    }
  }, [createProjectInitNodes]);
  useEffect(() => {
    if (parseInt(id) < projects.length) router.push("/");
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
          setOpenCreateEdgeModal={setOpenCreateEdgeModal}
        />
      </div>
      <div className="fixed top-0 left-0 right-0 select-none ">
        <div className="flex justify-center">
          <p className="text-center 2xl:text-lg text-sm font-semibold py-2 px-4  bg-gray-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-300 rounded-b-lg">
            {projects[parseInt(id) - 1].name}
          </p>
        </div>
      </div>
      <ToolBar
        setOpenCreateNodeModal={setOpenCreateNodeModal}
        setOpenExportModal={setOpenExportModal}
      />
      <CreateNodeModal
        nodes={nodes}
        onAddNode={onAddNode}
        open={openCreateNodeModal}
        setOpen={setOpenCreateNodeModal}
      />
      <CreateEdgeModal
        edgeData={openCreateEdgeModal}
        setEdgeData={setOpenCreateEdgeModal}
      />
      <DeployAppSheet nodes={nodes} />
      <ExportModal
        open={openExportModal}
        setOpen={setOpenExportModal}
        name={projects[parseInt(id) - 1].name}
      />
      <AskGojoSheetWrapper id={id} onAddNode={onAddNode} nodes={nodes} />
      <ViewCodeModal nodes={nodes} />
    </div>
  );
}
