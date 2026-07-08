"use client";

import { useCallback, useState } from "react";
import { debounce } from "@/utils";

/**
 * Hook untuk search input dengan debounce
 * @param delay - Delay dalam ms (default 300ms)
 */
export function useDebounceSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetter = useCallback(
    debounce((value: string) => setDebouncedQuery(value), delay),
    [delay]
  );

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      debouncedSetter(value);
    },
    [debouncedSetter]
  );

  const reset = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);

  return { query, debouncedQuery, handleChange, reset };
}
