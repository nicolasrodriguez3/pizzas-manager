"use client";

import { createContext, useContext, useRef } from "react";
import { create, StoreApi, useStore } from "zustand";

interface SidebarState {
  isOpen: boolean; // Mobile-only state
  isCollapsed: boolean; // Desktop-only state
}

interface SidebarActions {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  setCollapsed: (isCollapsed: boolean) => void;
}

type SidebarStore = SidebarState & SidebarActions;

const createSidebarStore = (defaultCollapsed: boolean) => {
  return create<SidebarStore>((set) => ({
    isOpen: false,
    isCollapsed: defaultCollapsed,
    openSidebar: () => set({ isOpen: true }),
    closeSidebar: () => set({ isOpen: false }),
    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
  }));
};

const SidebarContext = createContext<StoreApi<SidebarStore> | null>(null);

export const SidebarProvider = ({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) => {
  const storeRef = useRef<StoreApi<SidebarStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createSidebarStore(defaultCollapsed);
  }

  return (
    <SidebarContext.Provider value={storeRef.current}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = <T,>(selector: (state: SidebarStore) => T): T => {
  const store = useContext(SidebarContext);
  if (!store) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return useStore(store, selector);
};
