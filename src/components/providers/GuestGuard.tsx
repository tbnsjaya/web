"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  if (isAuthenticated) {
    return null; // Will redirect to dashboard or original destination
  }

  return <>{children}</>;
}
