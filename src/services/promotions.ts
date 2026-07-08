import { api } from "./api";
import type { Promotion, Banner, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const PromotionService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Promotion>>> => {
    return api.get<PaginatedData<Promotion>>("promotions", params);
  },

  create: async (payload: Omit<Promotion, "id" | "productName">): Promise<ApiResponse<Promotion>> => {
    return api.post<Promotion>("promotion", payload);
  },

  update: async (id: string, payload: Partial<Promotion>): Promise<ApiResponse<Promotion>> => {
    return api.put<Promotion>("promotion", { id, ...payload });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("promotion", { id });
  },

  getBanners: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Banner>>> => {
    return api.get<PaginatedData<Banner>>("banners", params);
  },

  createBanner: async (payload: Omit<Banner, "id">): Promise<ApiResponse<Banner>> => {
    return api.post<Banner>("banner", payload);
  },

  updateBanner: async (id: string, payload: Partial<Banner>): Promise<ApiResponse<Banner>> => {
    return api.put<Banner>("banner", { id, ...payload });
  },

  deleteBanner: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("banner", { id });
  }
};
