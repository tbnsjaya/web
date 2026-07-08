import { api } from "./api";
import type { Kasbon, PaginatedData, PaginationParams, ApiResponse, KasbonPayment } from "@/types";

export const KasbonService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Kasbon>>> => {
    return api.get<PaginatedData<Kasbon>>("kasbon", params);
  },

  pay: async (payload: { kasbonId: string; amount: number }): Promise<ApiResponse<KasbonPayment>> => {
    return api.request<KasbonPayment>("payKasbon", payload);
  }
};
