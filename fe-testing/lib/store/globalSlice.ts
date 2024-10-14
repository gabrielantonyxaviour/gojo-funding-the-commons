import { StateCreator } from "zustand";

interface GlobalState {
  openProjectsBar: boolean;
}

interface GlobalActions {
  setOpenProjectsBar: (value: boolean) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  openProjectsBar: false,
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
});
