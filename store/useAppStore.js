import { create } from 'zustand'

export const useAppStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}))