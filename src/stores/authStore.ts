import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

/**
 * Auth Store — Persisted di localStorage
 * Menyimpan data user dan token JWT
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("tbnsjaya_token", token);
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem("tbnsjaya_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      /**
       * Check apakah user memiliki salah satu dari roles yang diberikan
       */
      hasRole: (...roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.roleName);
      },
    }),
    {
      name: "tbnsjaya_auth",
      storage: createJSONStorage(() => localStorage),
      // Hanya persist field tertentu
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
