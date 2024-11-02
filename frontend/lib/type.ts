import {
  type MarkerType,
  type OnConnectEnd,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import { Dispatch, SetStateAction } from "react";
import { WalletSelector } from "@near-wallet-selector/core";
export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    chainId: number;
    address: string;
    code: string;
    salt: number;
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
  data: {
    label: string;
    salt: number;
  };
}
export interface FlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setOpenCreateEdgeModal: (data: any) => void;
}

export interface Convo {
  id: string;
  message: string;
  isAi: boolean;
  node: Node | null;
}

export interface Conversation {
  id: string;
  isGojo: boolean;
  message: string;
  reference_node_hash: string;
  contracts: string[];
}
interface CallMethodOptions {
  contractId: string;
  method: string;
  args?: Record<string, any>;
  gas?: string;
  deposit?: string;
}

interface ViewMethodOptions {
  contractId: string;
  method: string;
  args?: Record<string, any>;
}

export interface Wallet {
  createAccessKeyFor?: string;
  networkId: string;
  selector: Promise<WalletSelector>;

  startUp(
    accountChangeHook: (accountId: string | undefined) => void
  ): Promise<string>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  viewMethod(options: ViewMethodOptions): Promise<any>;
  callMethod(options: CallMethodOptions): Promise<any>;
  getTransactionResult(txhash: string): Promise<any>;
}

export interface Agent {
  id: number;
  name: string;
  image: string;
}

export interface AIQueryContract {
  nodeId: string;
  chainId: number;
  code: string;
  label: string;
  usedAIAgents: number[];
}

export interface AIQuery {
  message: string;
  contracts: AIQueryContract[];
  selectedContract: string | null;
  selectedConnection: string[] | null;
}

export interface AIResponse {
  message: string;
  contracts: AIQueryContract[];
  agentsUsedInGeneration: number[];
}

export interface Project {
  id: string;
  name: string;
  initPrompt: string;
}
