import { api } from "./api";
import type { Sale, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const SalesService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Sale>>> => {
    return api.get<PaginatedData<Sale>>("sales", params);
  },

  create: async (payload: {
    invoiceNo: string;
    customerId?: string;
    subtotal: number;
    discount?: number;
    total: number;
    paymentMethod: string;
    details: Array<{ productId: string; qty: number; price: number }>;
  }): Promise<ApiResponse<Sale>> => {
    return api.post<Sale>("sale", payload);
  },

  void: async (id: string): Promise<ApiResponse<void>> => {
    return api.request<void>("voidSale", { id });
  }
};
