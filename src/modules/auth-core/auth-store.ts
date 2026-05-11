import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  username: string;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  encryptionKey?: string;
  expiresAt?: number; // Unix timestamp in milliseconds
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  updateTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  isTokenExpired: () => boolean;
  getTimeUntilExpiry: () => number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),

      updateTokens: (tokens) => set({ tokens }),

      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),

      isTokenExpired: () => {
        const { tokens } = get();
        if (!tokens?.expiresAt) return false;
        // Consider token expired 30 seconds before actual expiry for safety margin
        return Date.now() >= tokens.expiresAt - 30000;
      },

      getTimeUntilExpiry: () => {
        const { tokens } = get();
        if (!tokens?.expiresAt) return null;
        return tokens.expiresAt - Date.now();
      },
    }),
    { name: "auth-storage" },
  ),
);
