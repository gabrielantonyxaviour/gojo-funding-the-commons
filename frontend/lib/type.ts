import { type OnConnectEnd, OnEdgesChange, OnNodesChange } from "@xyflow/react";
import { Dispatch, SetStateAction } from "react";
export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface Edge {
  id: string;
  type: string;
  source: string;
  target: string;
}
export interface FlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setNodeIds: Dispatch<SetStateAction<number>>;
  setEdgeIds: Dispatch<SetStateAction<number>>;
}
