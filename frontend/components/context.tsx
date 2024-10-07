"use client";

import { createEnvironmentStore, type EnvironmentStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useStore } from "zustand";

export type EnvironmentStoreApi = ReturnType<typeof createEnvironmentStore>;

export const EnvironmentStoreContext = createContext<
  EnvironmentStoreApi | undefined
>(undefined);

export interface EnvironmentStoreProviderProps {
  children: ReactNode;
}

export const EnvironmentStoreProvider = ({
  children,
}: EnvironmentStoreProviderProps) => {
  const storeRef = useRef<EnvironmentStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createEnvironmentStore();
  }

  return (
    <EnvironmentStoreContext.Provider value={storeRef.current}>
      {children}
    </EnvironmentStoreContext.Provider>
  );
};

export const useEnvironmentStore = <T,>(
  selector: (store: EnvironmentStore) => T
): T => {
  const counterStoreContext = useContext(EnvironmentStoreContext);
  if (!counterStoreContext) {
    throw new Error(
      "useEnvironmentStore must be used within a EnvironmentStoreProvider"
    );
  }
  return useStore(counterStoreContext, selector);
};
