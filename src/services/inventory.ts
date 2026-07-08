import { api } from "./api";
import type { StockMovement, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const StockService = {
  getMovements: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<StockMovement>>> => {
    return api.get<PaginatedData<StockMovement>>("stockMovements", params);
  },

  adjust: async (payload: {
    productId: string;
    type: "IN" | "OUT" | "ADJ";
    qty: number;
    note?: string;
  }): Promise<ApiResponse<StockMovement>> => {
    return api.post<StockMovement>("stockMovement", payload);
  }
};
