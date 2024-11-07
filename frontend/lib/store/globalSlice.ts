import { StateCreator } from "zustand";
import { Near, Account } from "near-api-js";
import { Wallet } from "../services/near-wallet";
import { GOJO_CONTRACT } from "../constants";
import { Conversation, Node, Project } from "../type";

interface GlobalState {
  openProjectsBar: boolean;
  balance: string;
  prompt: string;
  viewCodeNodeId: string;
  conversations: Record<string, Conversation[]>;
  nearConnection: Near | null;
  gojoNearConnection: Near | null;
  gojoAccount: Account | null;
  userAccount: Account | null;
  evmUserAddress: string;
  wallet: Wallet;
  signedAccountId: string;
  ethBalance: string;
  baseBalance: string;
  polBalance: string;
  projects: Project[];
  createProjectInitNodes: Node[];
}

interface GlobalActions {
  setOpenProjectsBar: (value: boolean) => void;
  setBalance: (value: string) => void;
  setPrompt: (value: string) => void;
  addChat: (projectId: string, convo: Conversation) => void;
  setNearConnection: (value: Near | null) => void;
  setAccounts: (gojo: Account | null, user: Account | null) => void;
  setSignedAccountId: (value: string) => void;
  setEvmUserAddress: (value: string) => void;
  setViewCodeNodeId: (value: string) => void;
  setBalances: (eth: string, base: string, pol: string) => void;
  addProject: (project: Project) => void;
  setGojoNearConnection: (val: Near) => void;
  setProjects: (projects: Project[]) => void;
  setCreateProjectInitNodes: (nodes: Node[]) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  openProjectsBar: false,
  balance: "0",
  prompt: "",
  conversations: {},
  nearConnection: null,
  gojoNearConnection: null,
  gojoAccount: null,
  userAccount: null,
  wallet: new Wallet({
    networkId: "testnet",
    createAccessKeyFor: GOJO_CONTRACT,
  }),
  projects: [],
  signedAccountId: "",
  evmUserAddress: "",
  viewCodeNodeId: "",
  ethBalance: "0",
  baseBalance: "0",
  polBalance: "0",
  createProjectInitNodes: [],
};

export const createGlobalSlice: StateCreator<
  GlobalSlice,
  [],
  [],
  GlobalSlice
> = (set) => ({
  ...initialGlobalState,
  setOpenProjectsBar: (value) =>
    set((state) => ({ ...state, openProjectsBar: value })),
  setBalance: (value) => set((state) => ({ ...state, balance: value })),
  setPrompt: (value) => set((state) => ({ ...state, prompt: value })),
  setNearConnection: (value) =>
    set((state) => ({ ...state, nearConnection: value })),
  setAccounts: (gojo, user) =>
    set((state) => ({ ...state, gojoAccount: gojo, userAccount: user })),
  setSignedAccountId: (value) =>
    set((state) => ({ ...state, signedAccountId: value })),
  setEvmUserAddress: (value) =>
    set((state) => ({ ...state, evmUserAddress: value })),
  setGojoNearConnection: (value) =>
    set((state) => ({ ...state, gojoNearConnection: value })),
  addChat: (projectId, convo) =>
    set((state) => {
      const conversations = state.conversations[projectId] || [];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [projectId]: [...conversations, convo],
        },
      };
    }),
  setViewCodeNodeId: (value) =>
    set((state) => ({ ...state, viewCodeNodeId: value })),
  setBalances: (eth, pol, base) =>
    set((state) => ({
      ...state,
      ethBalance: eth,
      polBalance: pol,
      baseBalance: base,
    })),
  addProject: (proj) =>
    set((state) => ({ ...state, projects: [...state.projects, proj] })),
  setCreateProjectInitNodes: (nodes) =>
    set((state) => ({ ...state, createProjectInitNodes: nodes })),
  setProjects: (projects) => set((state) => ({ ...state, projects: projects })),
});
