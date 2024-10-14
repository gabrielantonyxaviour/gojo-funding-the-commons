import {
  type MarkerType,
  type OnConnectEnd,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import { Dispatch, SetStateAction } from "react";
export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    chain: {
      name: string;
      chainId: number;
      image: string;
    };
    address: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface Chain {
  name: string;
  chainId: number;
  image: string;
}
export interface Edge {
  id: string;
  type: string;
  source: string;
  target: string;
  markerEnd: {
    type: MarkerType;
  };
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
  setOpenCreateEdgeModal: (data: any) => void;
}

export interface Convo {
  id: string;
  message: string;
  isAi: boolean;
  node: Node | null;
}
