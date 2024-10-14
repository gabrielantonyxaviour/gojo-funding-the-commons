import { createStore } from "zustand";
import { createProfileSlice, ProfileSlice } from "./profileSlice";
import { createGlobalSlice, GlobalSlice } from "./globalSlice";
import { createProjectSlice, ProjectSlice } from "./projectSlice";
export type EnvironmentStore = ProfileSlice & GlobalSlice & ProjectSlice;

export const createEnvironmentStore = () =>
  createStore<EnvironmentStore>()((...a) => ({
    ...createProfileSlice(...a),
    ...createGlobalSlice(...a),
    ...createProjectSlice(...a),
  }));
