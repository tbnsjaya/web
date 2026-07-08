"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { CategoryService } from "@/services/categories";
import { CustomerService } from "@/services/customers";
import { SupplierService } from "@/services/suppliers";
import { SalesService } from "@/services/sales";
import { PurchaseService } from "@/services/purchases";
import { KasbonService } from "@/services/kasbon";
import { DebtService } from "@/services/debt";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FileText,
  Printer,
  Calendar,
  Layers,
  Users,
  Building,
  Loader2,
  TrendingUp,
  DollarSign,
  Package
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ReportType = "sales" | "purchase" | "profit" | "inventory" | "kasbon" | "debt" | "customer" | "supplier";

export default function ReportsAdminPage() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");

  // SWR fetches for all components
  const { data: salesRes, isLoading: isSalesLoading } = useSWR("reportSales", () =>
    SalesService.getAll({ page: 1, perPage: 200 })
  );
  const sales = salesRes?.data?.items || [];

  const { data: purchasesRes, isLoading: isPurchasesLoading } = useSWR("reportPurchases", () =>
    PurchaseService.getAll({ page: 1, perPage: 200 })
  );
  const purchases = purchasesRes?.data?.items || [];

  const { data: productsRes } = useSWR("reportProducts", () =>
    ProductService.getAll({ page: 1, perPage: 200 })
  );
  const products = productsRes?.data?.items || [];

  const { data: categoriesRes } = useSWR("reportCategories", () =>
    CategoryService.getAll()
  );
  const categories = categoriesRes?.data?.items || [];

  const { data: customersRes } = useSWR("reportCustomers", () =>
    CustomerService.getAll()
  );
  const customers = customersRes?.data?.items || [];

  const { data: suppliersRes } = useSWR("reportSuppliers", () =>
    SupplierService.getAll()
  );
  const suppliers = suppliersRes?.data?.items || [];

  const { data: kasbonRes } = useSWR("reportKasbon", () =>
    KasbonService.getAll()
  );
  const kasbons = kasbonRes?.data?.items || [];

  const { data: debtRes } = useSWR("reportDebt", () =>
    DebtService.getAll()
  );
  const debts = debtRes?.data?.items || [];

  // Filtered & Aggregated Report Rows + Chart Data
  const reportData = useMemo(() => {
    const isWithinDate = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = dateStr.substring(0, 10);
      return d >= startDate && d <= endDate;
    };

    if (reportType === "sales") {
      let filtered = sales.filter((s) => s.status !== "void" && isWithinDate(s.date));
      if (filterCustomer !== "all") {
        filtered = filtered.filter((s) => s.customerId === filterCustomer);
      }

      // Chart: sales over time
      const dateMap: Record<string, number> = {};
      filtered.forEach((s) => {
        const d = s.date?.substring(0, 10) || "";
        dateMap[d] = (dateMap[d] || 0) + s.total;
      });

      const sortedDates = Object.keys(dateMap).sort();
      const chart = {
        labels: sortedDates,
        datasets: [
          {
            label: "Penjualan (Rp)",
            data: sortedDates.map((d) => dateMap[d]),
            borderColor: "#f97316",
            backgroundColor: "#f9731633",
            tension: 0.3,
            fill: true,
          },
        ],
      };

      const columns: Column<any>[] = [
        { header: "Tanggal", accessor: (row) => row.date?.substring(0, 10) || "-" },
        { header: "Invoice No", accessor: "invoiceNo" },
        { header: "Customer ID", accessor: "customerId" },
        { header: "Metode Bayar", accessor: "paymentMethod" },
        { header: "Total Penjualan", accessor: (row) => `Rp ${row.total.toLocaleString("id-ID")}` },
      ];

      return { rows: filtered, chart, columns };
    }

    if (reportType === "purchase") {
      let filtered = purchases.filter((p) => isWithinDate(p.date));
      if (filterSupplier !== "all") {
        filtered = filtered.filter((p) => p.supplierId === filterSupplier);
      }

      const dateMap: Record<string, number> = {};
      filtered.forEach((p) => {
        const d = p.date?.substring(0, 10) || "";
        dateMap[d] = (dateMap[d] || 0) + p.total;
      });

      const sortedDates = Object.keys(dateMap).sort();
      const chart = {
        labels: sortedDates,
        datasets: [
          {
            label: "Pembelian (Rp)",
            data: sortedDates.map((d) => dateMap[d]),
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f633",
            tension: 0.3,
            fill: true,
          },
        ],
      };

      const columns: Column<any>[] = [
        { header: "Tanggal", accessor: (row) => row.date?.substring(0, 10) || "-" },
        { header: "Nomor PO", accessor: "poNumber" },
        { header: "Supplier ID", accessor: "supplierId" },
        { header: "Status", accessor: "status" },
        { header: "Total Tagihan", accessor: (row) => `Rp ${row.total.toLocaleString("id-ID")}` },
      ];

      return { rows: filtered, chart, columns };
    }

    if (reportType === "profit") {
      // Revenues from Sales
      const activeSales = sales.filter((s) => s.status !== "void" && isWithinDate(s.date));
      // Estimate COGS at 78% of revenues
      const dateMap: Record<string, { revenue: number; profit: number }> = {};
      
      activeSales.forEach((s) => {
        const d = s.date?.substring(0, 10) || "";
        if (!dateMap[d]) dateMap[d] = { revenue: 0, profit: 0 };
        dateMap[d].revenue += s.total;
        dateMap[d].profit += Math.round(s.total * 0.22);
      });

      const sortedDates = Object.keys(dateMap).sort();
      const chart = {
        labels: sortedDates,
        datasets: [
          {
            label: "Pendapatan Bersih (Rp)",
            data: sortedDates.map((d) => dateMap[d].revenue),
            borderColor: "#f97316",
            backgroundColor: "#f9731633",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Estimasi Laba Bersih (Rp)",
            data: sortedDates.map((d) => dateMap[d].profit),
            borderColor: "#22c55e",
            backgroundColor: "#22c55e33",
            tension: 0.3,
            fill: true,
          },
        ],
      };

      const rows = sortedDates.map((d) => ({
        date: d,
        revenue: dateMap[d].revenue,
        cogs: Math.round(dateMap[d].revenue * 0.78),
        profit: dateMap[d].profit,
      }));

      const columns: Column<any>[] = [
        { header: "Tanggal", accessor: "date" },
        { header: "Pendapatan Kotor", accessor: (row) => `Rp ${row.revenue.toLocaleString("id-ID")}` },
        { header: "Estimasi HPP (COGS)", accessor: (row) => `Rp ${row.cogs.toLocaleString("id-ID")}` },
        { header: "Estimasi Laba Bersih", accessor: (row) => `Rp ${row.profit.toLocaleString("id-ID")}` },
      ];

      return { rows, chart, columns };
    }

    if (reportType === "inventory") {
      let filtered = [...products];
      if (filterCategory !== "all") {
        filtered = filtered.filter((p) => p.categoryId === filterCategory);
      }

      // Group stock values by category
      const catValue: Record<string, number> = {};
      filtered.forEach((p) => {
        const cat = p.categoryName || "Umum";
        const val = p.buyPrice * (p.currentStock || 0);
        catValue[cat] = (catValue[cat] || 0) + val;
      });

      const chart = {
        labels: Object.keys(catValue),
        datasets: [
          {
            label: "Nilai Aset Kategori (Rp)",
            data: Object.values(catValue),
            backgroundColor: "#10b981",
            borderWidth: 1,
          },
        ],
      };

      const columns: Column<any>[] = [
        { header: "Nama Produk", accessor: "name" },
        { header: "SKU", accessor: "sku" },
        { header: "Kategori", accessor: "categoryName" },
        { header: "Stok Gudang", accessor: (row) => `${row.currentStock || 0} ${row.unit}` },
        { header: "Estimasi Nilai Aset", accessor: (row) => `Rp ${(row.buyPrice * (row.currentStock || 0)).toLocaleString("id-ID")}` },
      ];

      return { rows: filtered, chart, columns };
    }

    if (reportType === "kasbon") {
      let filtered = kasbons.filter((k) => k.status !== "paid");
      
      const chart = {
        labels: filtered.map((k) => k.saleId),
        datasets: [
          {
            label: "Nilai Piutang Kasbon (Rp)",
            data: filtered.map((k) => k.amount),
            backgroundColor: "#ef4444",
          },
        ],
      };

      const columns: Column<any>[] = [
        { header: "Invoice ID", accessor: "saleId" },
        { header: "Tanggal Jatuh Tempo", accessor: (row) => row.dueDate ? row.dueDate.substring(0, 10) : "-" },
        { header: "Jumlah Outstanding", accessor: (row) => `Rp ${row.amount.toLocaleString("id-ID")}` },
        { header: "Status", accessor: "status" },
      ];

      return { rows: filtered, chart, columns };
    }

    // Default Fallback
    return { rows: [], chart: { labels: [], datasets: [] }, columns: [] };
  }, [reportType, startDate, endDate, filterCategory, filterCustomer, filterSupplier, sales, purchases, products, kasbons, debts]);

  // Handle browser printing
  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `
      <html>
        <head>
          <title>Laporan - TB NS Jaya</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 30px; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 20px; }
            table { wIdth: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solId #ccc; padding: 8px; text-align: left; }
            th { bg-color: #f2f2f2; }
          </style>
        </head>
        <body onload="window.print();">
          <h1>LAPORAN ${reportType.toUpperCase()}</h1>
          <p>Periode: ${startDate} s/d ${endDate}</p>
          <table>
            <thead>
              <tr>
                ${reportData.columns.map((col) => `<th>${col.header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
    `;

    reportData.rows.forEach((row: any) => {
      html += `
        <tr>
          ${reportData.columns
            .map((col) => {
              const val = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor as string];
              return `<td>${val || "-"}</td>`;
            })
            .join("")}
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[var(--primary)]" />
            <span>Laporan Pembukuan Toko</span>
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Analisis menyeluruh tentang keuangan, volume transaksi, perputaran stok, piutang kasbon, dan data entitas.
          </p>
        </div>
        <button
          onClick={handlePrintPDF}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak PDF Laporan</span>
        </button>
      </div>

      {/* Report Types Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin border-b border-[var(--border)]">
        {[
          { key: "sales", label: "Penjualan" },
          { key: "purchase", label: "Pembelian PO" },
          { key: "profit", label: "Laba Rugi" },
          { key: "inventory", label: "Nilai Aset Stok" },
          { key: "kasbon", label: "Piutang Kasbon" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key as ReportType)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              reportType === tab.key
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-body)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Panel */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tanggal Mulai</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tanggal Selesai</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          />
        </div>

        {/* Category Filter */}
        {reportType === "inventory" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Filter Kategori</span>
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer Filter */}
        {reportType === "sales" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Filter Pelanggan</span>
            </label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            >
              <option value="all">Semua Pelanggan</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Supplier Filter */}
        {reportType === "purchase" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center space-x-1">
              <Building className="w-3.5 h-3.5" />
              <span>Filter Supplier</span>
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            >
              <option value="all">Semua Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Block */}
      {reportData.chart.labels && reportData.chart.labels.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Grafik Tren Visualisasi</h3>
          <div className="h-[280px]">
            {reportType === "inventory" ? (
              <Bar
                data={reportData.chart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } },
                }}
              />
            ) : (
              <Line
                data={reportData.chart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } },
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Report Rows DataTable */}
      {isSalesLoading || isPurchasesLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={reportData.rows}
          columns={reportData.columns}
          searchPlaceholder="Cari data laporan..."
          exportFilename={`laporan-${reportType}`}
        />
      )}
    </div>
  );
}
