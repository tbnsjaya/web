"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { DashboardService } from "@/services/dashboard";
import { ProductService } from "@/services/products";
import { CustomerService } from "@/services/customers";
import { SupplierService } from "@/services/suppliers";
import { SalesService } from "@/services/sales";
import { gasRequest } from "@/services/api/request";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/stores";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Users,
  Building,
  Package,
  CheckCircle,
  Bell,
  Clock,
  ArrowRight,
  TrendingDown,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const isOwner = user?.roleName === "owner" || user?.roleName === "admin";

  // SWR fetches for statistics and dependencies
  const { data: statsRes, isLoading: isStatsLoading } = useSWR("dashboardStats", () =>
    DashboardService.getStats()
  );
  const stats = statsRes?.data?.kpi;

  const { data: productsRes } = useSWR("dashboardProducts", () =>
    ProductService.getAll({ page: 1, perPage: 100 })
  );
  const products = productsRes?.data?.items || [];

  const { data: customersRes } = useSWR("dashboardCustomers", () =>
    CustomerService.getAll({ page: 1, perPage: 100 })
  );
  const customers = customersRes?.data?.items || [];

  const { data: suppliersRes } = useSWR("dashboardSuppliers", () =>
    SupplierService.getAll({ page: 1, perPage: 100 })
  );
  const suppliers = suppliersRes?.data?.items || [];

  const { data: salesRes } = useSWR("dashboardSales", () =>
    SalesService.getAll({ page: 1, perPage: 100 })
  );
  const sales = salesRes?.data?.items || [];

  // Notifications with Optimistic Update support
  const { data: notificationsRes, mutate: mutateNotifications } = useSWR(
    "dashboardNotifications",
    () => gasRequest<{ items: any[] }>("getNotifications")
  );
  const notifications = notificationsRes?.data?.items || [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Optimistic update handler for notifications
  const handleMarkNotificationRead = async (id: string) => {
    const originalData = notificationsRes;
    if (!originalData?.data) return;

    // Build optimistic payload
    const updatedItems = originalData.data.items.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );

    // Trigger SWR optimistic mutation
    mutateNotifications(
      {
        ...originalData,
        data: { ...originalData.data, items: updatedItems },
      },
      { revalidate: false }
    );

    toast.success("Notifikasi ditandai dibaca (Selesai)");

    try {
      const response = await gasRequest("readNotification", { id });
      if (!response.success) {
        throw new Error("Gagal memproses di server");
      }
      // Revalidate to sync with actual backend state
      mutateNotifications();
    } catch (error) {
      toast.error("Gagal sinkronisasi data");
      // Rollback to original state on failure
      mutateNotifications(originalData);
    }
  };

  // Computations for KPI cards
  const summaryKpi = useMemo(() => {
    const activeSales = sales.filter((s) => s.status !== "void");
    const omzet = activeSales.reduce((acc, s) => acc + s.total, 0);
    
    // Estimate Profit: margin of 22% from total sales
    const laba = Math.round(omzet * 0.22);

    return {
      omzet,
      laba,
      productsCount: products.length,
      customersCount: customers.length,
      suppliersCount: suppliers.length,
    };
  }, [sales, products, customers, suppliers]);

  // Filter low stock products details
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.currentStock !== undefined && p.currentStock < 10);
  }, [products]);

  // Chart configuration
  const chartData = useMemo(() => {
    // Omzet & Laba Trend (last 6 transactions / days)
    const recentSales = [...sales].reverse().slice(0, 6);
    const labels = recentSales.map((s) => s.invoiceNo);
    const revenues = recentSales.map((s) => s.total);
    const profits = recentSales.map((s) => Math.round(s.total * 0.22));

    const lineData = {
      labels,
      datasets: [
        {
          label: "Omzet (Rp)",
          data: revenues,
          borderColor: "#f97316",
          backgroundColor: "#f9731633",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Laba Bersih (Rp)",
          data: profits,
          borderColor: "#22c55e",
          backgroundColor: "#22c55e33",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    // Category Doughnut Chart
    const categoryCount: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.categoryName || "Umum";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const doughnutData = {
      labels: Object.keys(categoryCount),
      datasets: [
        {
          data: Object.values(categoryCount),
          backgroundColor: [
            "#f97316",
            "#3b82f6",
            "#22c55e",
            "#a855f7",
            "#eab308",
            "#64748b",
          ],
          borderWidth: 1,
        },
      ],
    };

    return { lineData, doughnutData };
  }, [sales, products]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Dashboard Pemilik (Owner)
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Analisis kesehatan keuangan usaha dan performa operasional toko secara real-time.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 text-[var(--primary)] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
          <UserCheck className="w-4 h-4" />
          <span>Level Akses: {user?.roleName}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Omzet */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Omzet</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">
              Rp {summaryKpi.omzet.toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] text-green-500 font-semibold flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs bulan lalu</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Laba */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Estimasi Laba</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">
              Rp {summaryKpi.laba.toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] text-green-500 font-semibold flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Margin 22% stabil</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Kasbon */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Piutang Kasbon</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">
              Rp {(stats?.outstandingKasbon || 0).toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] text-amber-500 font-semibold">
              Menunggu jatuh tempo
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Utang */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Utang Supplier</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">
              Rp {(stats?.outstandingDebt || 0).toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] text-[var(--text-muted)]">
              Jatuh tempo berjalan
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Relational Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-[var(--text-muted)] uppercase font-bold">Total Pelanggan</h4>
            <p className="text-base font-bold text-[var(--text-heading)]">{summaryKpi.customersCount} Orang</p>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-[var(--text-muted)] uppercase font-bold">Total Supplier</h4>
            <p className="text-base font-bold text-[var(--text-heading)]">{summaryKpi.suppliersCount} Vendor</p>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-[var(--text-muted)] uppercase font-bold">Total Varian Produk</h4>
            <p className="text-base font-bold text-[var(--text-heading)]">{summaryKpi.productsCount} Item</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Line Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Tren Omzet &amp; Laba Bersih</h3>
          <div className="h-[280px]">
            <Line
              data={chartData.lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { grid: { color: "var(--border-muted)" }, ticks: { font: { size: 9 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                },
                plugins: { legend: { labels: { font: { size: 10 } } } },
              }}
            />
          </div>
        </div>

        {/* Right: Doughnut Category Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Penyebaran Produk Per Kategori</h3>
          <div className="h-[280px] flex items-center justify-center">
            <Doughnut
              data={chartData.doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 9 } } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Widgets & Warnings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Warning */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Peringatan Stok Menipis</span>
            </h3>
            <span className="bg-red-500/10 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
              {lowStockProducts.length} Item
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[220px]">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-[var(--background)] rounded border border-[var(--border)]">
                  <div>
                    <p className="font-bold text-[var(--text-heading)]">{p.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">SKU: {p.sku}</p>
                  </div>
                  <span className="text-red-600 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-mono">
                    Stok: {p.currentStock}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                Stok seluruh barang aman.
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Reminders (Optimistic Update Demo) */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-[var(--primary)]" />
              <span>Notifikasi Sistem</span>
            </h3>
            {unreadNotifications.length > 0 && (
              <span className="bg-orange-500/10 text-[var(--primary)] px-2 py-0.5 rounded text-[10px] font-bold">
                {unreadNotifications.length} Baru
              </span>
            )}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[220px]">
            {notifications.length > 0 ? (
              notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded border text-xs flex justify-between items-start gap-2 ${
                    n.isRead
                      ? "bg-[var(--background)] border-[var(--border)] opacity-60"
                      : "bg-orange-500/5 border-orange-500/20"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-[var(--text-heading)]">{n.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className="text-[9px] font-bold text-[var(--primary)] bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded hover:bg-[var(--primary)] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                    >
                      Baca
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                Belum ada notifikasi.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/products"
              className="bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg p-3 text-center space-y-1.5 transition-colors cursor-pointer"
            >
              <Package className="w-5 h-5 text-[var(--primary)] mx-auto" />
              <span className="text-[10px] font-bold text-[var(--text-heading)] block">Kelola Produk</span>
            </Link>
            <Link
              href="/admin/pos"
              className="bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg p-3 text-center space-y-1.5 transition-colors cursor-pointer"
            >
              <DollarSign className="w-5 h-5 text-green-500 mx-auto" />
              <span className="text-[10px] font-bold text-[var(--text-heading)] block">Kasir POS</span>
            </Link>
            <Link
              href="/admin/blog"
              className="bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg p-3 text-center space-y-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5 text-blue-500 mx-auto" />
              <span className="text-[10px] font-bold text-[var(--text-heading)] block">Blog CMS</span>
            </Link>
            <a
              href="https://wa.me/6282330449041"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg p-3 text-center space-y-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-5 h-5 text-indigo-500 mx-auto" />
              <span className="text-[10px] font-bold text-[var(--text-heading)] block">Bantuan</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
