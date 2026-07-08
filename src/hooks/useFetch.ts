"use client";

import useSWR, { SWRConfiguration } from "swr";
import { gasRequest } from "@/services/api/request";

/**
 * Reusable hook wrapper around SWR specifically for Google Apps Script doPosts.
 * It uses the action name + serialized payload as the cache key.
 */
export function useFetch<TData = any, TError = any>(
  action: string | null,
  payload?: any,
  config?: SWRConfiguration
) {
  const key = action ? [action, JSON.stringify(payload || {})] : null;

  const { data, error, mutate, isValidating } = useSWR<TData, TError>(
    key,
    async () => {
      const res = await gasRequest<TData>(action!, payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch data");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      ...config,
    }
  );

  return {
    data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}
