import { api } from "./api";
import type { WebsiteSettings, ApiResponse } from "@/types";

export interface AnalyticsSettings {
  NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
  NEXT_PUBLIC_GTM_ID: string;
}

export const SettingsService = {
  getWebsite: async (): Promise<ApiResponse<WebsiteSettings>> => {
    return api.request<WebsiteSettings>("getWebsiteSettings");
  },

  updateWebsite: async (payload: Partial<WebsiteSettings>): Promise<ApiResponse<WebsiteSettings>> => {
    return api.request<WebsiteSettings>("updateWebsiteSettings", payload);
  },

  getAnalytics: async (): Promise<ApiResponse<AnalyticsSettings>> => {
    return api.request<AnalyticsSettings>("getAnalyticsSettings");
  },

  updateAnalytics: async (payload: Partial<AnalyticsSettings>): Promise<ApiResponse<AnalyticsSettings>> => {
    return api.request<AnalyticsSettings>("updateAnalyticsSettings", payload);
  }
};
