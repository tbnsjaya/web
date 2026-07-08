"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/services/api/fetcher";

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        // Default dedupe interval 2 detik
        dedupingInterval: 2000,
        // Stale-While-Revalidate: tampilkan data lama sambil refetch
        revalidateIfStale: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
