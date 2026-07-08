import { api } from "./api";
import type { ApiResponse } from "@/types";

export interface DashboardStats {
  kpi: {
    todaySales: number;
    totalSales: number;
    totalPurchases: number;
    outOfStockCount: number;
    lowStockCount: number;
    outstandingKasbon: number;
    outstandingDebt: number;
  };
}

export const DashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return api.request<DashboardStats>("getDashboardStats");
  }
};
