import { api } from "./api";
import type { SupplierDebt, PaginatedData, PaginationParams, ApiResponse, SupplierDebtPayment } from "@/types";

export const DebtService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<SupplierDebt>>> => {
    return api.get<PaginatedData<SupplierDebt>>("supplierDebt", params);
  },

  pay: async (payload: { supplierDebtId: string; amount: number }): Promise<ApiResponse<SupplierDebtPayment>> => {
    return api.request<SupplierDebtPayment>("paySupplierDebt", payload);
  }
};
