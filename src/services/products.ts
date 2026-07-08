import { api } from "./api";
import type { Product, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const ProductService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Product>>> => {
    return api.get<PaginatedData<Product>>("products", params);
  },

  create: async (payload: Omit<Product, "id" | "categoryName" | "currentStock"> & { imageUrl?: string }): Promise<ApiResponse<Product>> => {
    return api.post<Product>("product", payload);
  },

  update: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
    return api.put<Product>("product", { id, ...payload });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("product", { id });
  }
};
