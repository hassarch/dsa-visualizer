import { create } from 'zustand'

export const useAppStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: true,

  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      return { theme: next }
    }),

  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}))