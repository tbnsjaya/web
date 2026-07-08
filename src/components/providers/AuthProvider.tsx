"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { gasRequest } from "@/services/api/request";

interface AuthContextType {
  isInitializing: boolean;
  revalidateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isInitializing: true,
  revalidateSession: async () => false,
});

export const useAuthContext = () => useContext(AuthContext);

// Decode token client-side safely without third-party library
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, clearAuth, setAuth, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  const revalidateSession = async (): Promise<boolean> => {
    if (!token) {
      clearAuth();
      return false;
    }

    // Client-side JWT Expiry Check
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) {
      clearAuth();
      return false;
    }

    const currentTime = Date.now();
    if (currentTime >= decoded.exp) {
      clearAuth();
      return false;
    }

    // Verify token with backend
    try {
      const response = await gasRequest("getWebsiteSettings");
      if (response.success && user) {
        // Keep session active, refresh/update auth state
        setAuth(user, token);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (err) {
      // If server fails or offline, we might want to keep the local session,
      // but if it's 401/403, we clear it. AppApiError check can be added:
      const isUnauthorized = err && typeof err === "object" && "code" in err && (err.code === 401 || err.code === 403);
      if (isUnauthorized) {
        clearAuth();
        return false;
      }
      // If server is temporarily offline, keep user session but log warning
      console.warn("Auth server validation failed, keeping offline session:", err);
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        await revalidateSession();
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, []);

  // Show a beautiful industrial themed loading screen during initialization
  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--background)] transition-all duration-300">
        <div className="relative flex flex-col items-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-lg max-w-sm w-full text-center">
          {/* Subtle Orange Glow Spinner */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)] opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--primary)] animate-spin"></div>
          </div>
          <h3 className="font-heading text-lg font-bold text-[var(--text-heading)] mb-2 tracking-wide">
            TB NS JAYA
          </h3>
          <p className="font-body text-xs text-[var(--text-muted)] animate-pulse">
            Memuat otentikasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isInitializing, revalidateSession }}>
      {children}
    </AuthContext.Provider>
  );
}
