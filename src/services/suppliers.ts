import { api } from "./api";
import type { Supplier, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const SupplierService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Supplier>>> => {
    return api.get<PaginatedData<Supplier>>("suppliers", params);
  },

  create: async (payload: Omit<Supplier, "id">): Promise<ApiResponse<Supplier>> => {
    return api.post<Supplier>("supplier", payload);
  },

  update: async (id: string, payload: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    return api.put<Supplier>("supplier", { id, ...payload });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("supplier", { id });
  }
};
