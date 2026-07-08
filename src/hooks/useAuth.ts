"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores";
import { gasRequest } from "@/services/api/request";
import type { User, ApiResponse } from "@/types";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, hasRole } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
      const res = await gasRequest<{ token: string; user: User }>("login", { username, password });
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
      }
      return res;
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const checkPermission = useCallback(
    (requiredPermission: string): boolean => {
      if (!user) return false;
      if (user.roleName === "owner") return true;

      // Simple implementation of permission matrix matching
      const permissionsMap: Record<string, string[]> = {
        admin: [
          "dashboard.read",
          "products.*",
          "categories.*",
          "suppliers.*",
          "customers.*",
          "sales.read",
          "sales.create",
          "purchases.*",
          "stock.*",
          "kasbon.*",
          "debt.*",
          "blog.*",
          "media.*",
          "promotion.*",
          "settings.read",
          "reports.read",
          "analytics.read"
        ],
        kasir: [
          "dashboard.read",
          "products.read",
          "categories.read",
          "customers.*",
          "sales.create",
          "sales.read",
          "kasbon.read",
          "kasbon.create",
          "notifications.read"
        ]
      };

      const userPermissions = permissionsMap[user.roleName] || [];
      if (userPermissions.includes("*")) return true;
      if (userPermissions.includes(requiredPermission)) return true;

      // Match wildcard products.* against products.read
      const [domain] = requiredPermission.split(".");
      if (userPermissions.includes(`${domain}.*`)) return true;

      return false;
    },
    [user]
  );

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasRole,
    checkPermission,
  };
}
