import { create } from "zustand";

interface UIStore {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Mobile Drawer
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Active Section (untuk sidebar nav)
  activeSection: string;
  setActiveSection: (section: string) => void;
}

/**
 * UI Store — Mengelola global UI state
 * Tidak di-persist (reset saat refresh)
 */
export const useUIStore = create<UIStore>()((set) => ({
  // Sidebar state
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebarCollapse: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  // Mobile nav
  isMobileNavOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

  // Active navigation section
  activeSection: "",
  setActiveSection: (section) => set({ activeSection: section }),
}));
