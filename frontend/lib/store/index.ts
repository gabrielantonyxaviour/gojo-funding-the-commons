import { createStore } from "zustand";
import { createProfileSlice, ProfileSlice } from "./profileSlice";
import { createGlobalSlice, GlobalSlice } from "./globalSlice";
export type EnvironmentStore = ProfileSlice & GlobalSlice;

export const createEnvironmentStore = () =>
  createStore<EnvironmentStore>()((...a) => ({
    ...createProfileSlice(...a),
    ...createGlobalSlice(...a),
  }));
