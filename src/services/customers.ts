import { api } from "./api";
import type { Customer, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const CustomerService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Customer>>> => {
    return api.get<PaginatedData<Customer>>("customers", params);
  },

  create: async (payload: Omit<Customer, "id">): Promise<ApiResponse<Customer>> => {
    return api.post<Customer>("customer", payload);
  },

  update: async (id: string, payload: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return api.put<Customer>("customer", { id, ...payload });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("customer", { id });
  }
};
