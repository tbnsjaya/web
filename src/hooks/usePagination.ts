"use client";

import { useState, useCallback } from "react";
import type { PaginationParams } from "@/types";

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

/**
 * Hook untuk mengelola state pagination
 */
export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPerPage = 20 } = options;

  const [params, setParams] = useState<PaginationParams>({
    page: initialPage,
    perPage: initialPerPage,
    search: "",
    sortBy: "",
    sortOrder: "asc",
  });

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setParams((prev) => ({ ...prev, perPage, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: "asc" | "desc" = "asc") => {
    setParams((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const reset = useCallback(() => {
    setParams({ page: initialPage, perPage: initialPerPage, search: "", sortBy: "", sortOrder: "asc" });
  }, [initialPage, initialPerPage]);

  return { params, setPage, setPerPage, setSearch, setSort, reset };
}
