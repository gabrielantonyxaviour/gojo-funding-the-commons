import { StateCreator } from "zustand";
import { Node } from "@/lib/type";

interface ProjectState {
  askGojo: {
    open: boolean;
    node: Node | null;
  };
  appSettings: {
    open: boolean;
    node: Node | null;
  };
}

interface NodeActionValue {
  open: boolean;
  node: Node | null;
}

interface ProjectActions {
  setOpenAskGojo: (value: boolean) => void;
  setOpenAppSettings: (value: boolean) => void;
  setNodeOpenAskGojo: (value: NodeActionValue) => void;
  setNodeOpenAppSettings: (value: NodeActionValue) => void;
}

export type ProjectSlice = ProjectState & ProjectActions;

export const intialProjectState: ProjectState = {
  askGojo: {
    open: false,
    node: null,
  },
  appSettings: {
    open: false,
    node: null,
  },
};

export const createProjectSlice: StateCreator<
  ProjectSlice,
  [],
  [],
  ProjectSlice
> = (set) => ({
  ...intialProjectState,
  setOpenAskGojo: (value) =>
    set((state) => ({ ...state, askGojo: { ...state.askGojo, open: value } })),
  setOpenAppSettings: (value) =>
    set((state) => ({
      ...state,
      appSettings: { ...state.appSettings, open: value },
    })),
  setNodeOpenAskGojo: (value) => set((state) => ({ ...state, askGojo: value })),
  setNodeOpenAppSettings: (value) =>
    set((state) => ({ ...state, appSettings: value })),
});
