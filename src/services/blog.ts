import { api } from "./api";
import type { Blog, BlogCategory, PaginatedData, PaginationParams, ApiResponse } from "@/types";

export const BlogService = {
  getAll: async (params?: PaginationParams & { publishedOnly?: boolean }): Promise<ApiResponse<PaginatedData<Blog>>> => {
    return api.get<PaginatedData<Blog>>("blogs", params);
  },

  create: async (payload: Omit<Blog, "id" | "authorName" | "categoryName" | "createdAt">): Promise<ApiResponse<Blog>> => {
    return api.post<Blog>("blog", payload);
  },

  update: async (id: string, payload: Partial<Blog>): Promise<ApiResponse<Blog>> => {
    return api.put<Blog>("blog", { id, ...payload });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("blog", { id });
  },

  getCategories: async (params?: PaginationParams): Promise<ApiResponse<PaginatedData<BlogCategory>>> => {
    return api.get<PaginatedData<BlogCategory>>("blogCategories", params);
  },

  createCategory: async (payload: Omit<BlogCategory, "id">): Promise<ApiResponse<BlogCategory>> => {
    return api.post<BlogCategory>("blogCategory", payload);
  },

  updateCategory: async (id: string, payload: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> => {
    return api.put<BlogCategory>("blogCategory", { id, ...payload });
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>("blogCategory", { id });
  }
};
