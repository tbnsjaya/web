import { api } from "./api";
import type { Purchase, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const PurchaseService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Purchase>>> => {
    return api.get<PaginatedData<Purchase>>("purchases", params);
  },

  create: async (payload: {
    poNumber: string;
    supplierId: string;
    total: number;
    status: "lunas" | "hutang";
    details: Array<{ productId: string; qty: number; price: number }>;
  }): Promise<ApiResponse<Purchase>> => {
    return api.post<Purchase>("purchase", payload);
  }
};
