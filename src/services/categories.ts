import { api } from "./api";
import type { Category, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const CategoryService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Category>>> => {
    return api.get<PaginatedData<Category>>("categories", params);
  },

  create: async (payload: Omit<Category, "id">): Promise<ApiResponse<Category>> => {
    return api.post<Category>("category", payload);
  },

  update: async (id: string, payload: Partial<Category>): Promise<ApiResponse<Category>> => {
    return api.put<Category>("category", { id, ...payload });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("category", { id });
  }
};
