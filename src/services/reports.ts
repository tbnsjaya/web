import { api } from "./api";
import type { ApiResponse } from "@/types";

export interface SalesReportSummary {
  transactionCount: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercentage: number;
}

export interface SalesReportData {
  summary: SalesReportSummary;
  salesList: any[];
}

export const ReportService = {
  getSalesReport: async (payload: { startDate?: string; endDate?: string }): Promise<ApiResponse<SalesReportData>> => {
    return api.request<SalesReportData>("getSalesReport", payload);
  }
};
