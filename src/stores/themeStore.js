import { create } from "zustand"

export const useThemeStore = create((set) => ({
  theme: "light", // état initial : clair
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}))
