import { api } from "./api";
import type { Media, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const MediaService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<Media>>> => {
    return api.get<PaginatedData<Media>>("media", params);
  },

  upload: async (fileName: string, base64Data: string, type: string): Promise<ApiResponse<Media>> => {
    return api.upload<Media>(fileName, base64Data, type);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("media", { id });
  }
};
