"use client";

import { useState, useCallback } from "react";
import { useDebounceSearch } from "./useDebounceSearch";

export function useSearch(initialSearch = "", delay = 300) {
  const { query, debouncedQuery, handleChange, reset: resetDebounce } = useDebounceSearch(delay);
  const [search, setSearchState] = useState(initialSearch);

  const handleSearchChange = useCallback(
    (value: string) => {
      handleChange(value);
      setSearchState(value);
    },
    [handleChange]
  );

  const reset = useCallback(() => {
    resetDebounce();
    setSearchState("");
  }, [resetDebounce]);

  return {
    search: query,
    debouncedSearch: debouncedQuery,
    setSearch: handleSearchChange,
    reset,
  };
}
