"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  permission?: string;
}

export function AuthGuard({ children, permission }: AuthGuardProps) {
  const { isAuthenticated, checkPermission, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      // Save original URL to redirect back after login
      const query = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.push(`/admin/login${query}`);
      return;
    }

    if (permission && !checkPermission(permission)) {
      router.push("/admin/unauthorized?code=403");
    }
  }, [isAuthenticated, permission, checkPermission, router, pathname]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (permission && !checkPermission(permission)) {
    return null; // Will redirect to unauthorized page
  }

  return <>{children}</>;
}
