"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { BlogService } from "@/services/blog";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Bar, Doughnut } from "react-chartjs-2";
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
  Users,
  Clock,
  MousePointerClick,
  Share2,
  FolderHeart,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Activity
} from "lucide-react";

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

export default function AnalyticsDashboardPage() {
  // Fetch popular references
  const { data: productsRes } = useSWR("analyticsProducts", () =>
    ProductService.getAll()
  );
  const products = productsRes?.data?.items || [];

  const { data: blogsRes } = useSWR("analyticsBlogs", () =>
    BlogService.getAll()
  );
  const blogs = blogsRes?.data?.items || [];

  // Mock conversion ledger events
  const conversionEvents = useMemo(() => {
    return [
      { id: "1", event: "click_whatsapp", label: "Hubungi Floating WA", page: "/products/semen-gresik", time: "10 menit yang lalu" },
      { id: "2", event: "view_product", label: "Lihat Detail Semen", page: "/products/semen-gresik", time: "12 menit yang lalu" },
      { id: "3", event: "view_blog", label: "Baca Artikel Pondasi", page: "/blog/tips-pondasi-kokoh", time: "18 menit yang lalu" },
      { id: "4", event: "click_whatsapp", label: "Beli Now POS Link", page: "/products/besi-beton-12mm", time: "25 menit yang lalu" },
      { id: "5", event: "view_product", label: "Lihat Detail Cat", page: "/products/cat-dulux", time: "30 menit yang lalu" },
    ];
  }, []);

  // Compute popular items
  const popularProductsData = useMemo(() => {
    return products.slice(0, 5).map((p, idx) => ({
      name: p.name,
      sku: p.sku,
      pageViews: 1200 - idx * 150,
      conversionRate: (7.2 - idx * 0.8).toFixed(1) + "%",
    }));
  }, [products]);

  const popularBlogsData = useMemo(() => {
    return blogs.slice(0, 5).map((b, idx) => ({
      title: b.title,
      views: 850 - idx * 120,
      readTime: (4.5 - idx * 0.5).toFixed(1) + " Menit",
    }));
  }, [blogs]);

  // Traffic Source chart
  const doughnutData = {
    labels: ["Direct Traffic", "Organic Search", "Social Media", "Referrals"],
    datasets: [
      {
        data: [45, 30, 15, 10],
        backgroundColor: ["#f97316", "#3b82f6", "#22c55e", "#a855f7"],
        borderWidth: 1,
      },
    ],
  };

  // Conversions chart
  const barData = {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        label: "WhatsApp Clicks",
        data: [25, 32, 45, 30, 55, 68, 40],
        backgroundColor: "#22c55e",
      },
      {
        label: "Product Views (x10)",
        data: [15, 20, 28, 22, 35, 42, 30],
        backgroundColor: "#f97316",
      },
    ],
  };

  const columns: Column<any>[] = [
    { header: "Nama Event", accessor: "event", sortKey: "event" },
    { header: "Keterangan Aksi", accessor: "label" },
    { header: "Halaman Asal", accessor: "page" },
    { header: "Waktu Aksi", accessor: "time" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)] flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[var(--primary)]" />
            <span>Website Traffic &amp; Conversion Analytics</span>
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Monitor kunjungan pengunjung, sumber lalu lintas web, performa konten blog, dan konversi tombol checkout WhatsApp.
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Visitors */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Pengunjung</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">3,240 Sesi</p>
            <span className="text-[10px] text-green-500 font-semibold flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+18% vs minggu lalu</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Duration */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Rata-Rata Durasi</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">3m 45s</p>
            <span className="text-[10px] text-green-500 font-semibold">Keterlibatan tinggi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* WA Clicks */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Klik WhatsApp</h3>
            <p className="font-heading font-black text-xl text-green-600">290 Klik</p>
            <span className="text-[10px] text-green-500 font-semibold flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Conversion Rate 8.9%</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Rasio Pantulan</h3>
            <p className="font-heading font-black text-xl text-[var(--text-heading)]">38.4%</p>
            <span className="text-[10px] text-[var(--text-muted)]">Rasio rendah (bagus)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950/20 text-slate-500 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line / Bar Chart (Conversions) */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Tren Konversi WhatsApp &amp; Views</h3>
          <div className="h-[280px]">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } },
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart (Traffic Sources) */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Sumber Lalu Lintas (Traffic Source)</h3>
          <div className="h-[280px] flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 9 } } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Products & Top Blogs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Products */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] flex items-center space-x-1.5">
            <FolderHeart className="w-4.5 h-4.5 text-[var(--primary)]" />
            <span>Produk Terpopuler (Pageviews)</span>
          </h3>

          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--border-muted)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase">
                <tr>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3 text-center">Views</th>
                  <th className="p-3 text-right">Rasio Klik WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-body)]">
                {popularProductsData.length > 0 ? (
                  popularProductsData.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-[var(--border-muted)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-heading)]">{prod.name}</td>
                      <td className="p-3 text-center font-semibold font-mono">{prod.pageViews} Sesi</td>
                      <td className="p-3 text-right font-extrabold text-[var(--primary)] font-mono">{prod.conversionRate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-[var(--text-muted)] font-semibold">
                      Belum ada data interaksi produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Blogs */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] flex items-center space-x-1.5">
            <BookOpen className="w-4.5 h-4.5 text-blue-500" />
            <span>Artikel Blog Terpopuler</span>
          </h3>

          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--border-muted)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase">
                <tr>
                  <th className="p-3">Judul Artikel</th>
                  <th className="p-3 text-center">Views</th>
                  <th className="p-3 text-right">Rata Durasi Baca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-body)]">
                {popularBlogsData.length > 0 ? (
                  popularBlogsData.map((blog, idx) => (
                    <tr key={idx} className="hover:bg-[var(--border-muted)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-heading)] truncate max-w-[200px]" title={blog.title}>
                        {blog.title}
                      </td>
                      <td className="p-3 text-center font-semibold font-mono">{blog.views} Sesi</td>
                      <td className="p-3 text-right font-extrabold text-blue-500 font-mono">{blog.readTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-[var(--text-muted)] font-semibold">
                      Belum ada data interaksi blog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Event Tracking Log */}
      <div className="space-y-4">
        <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Log Tracker Event Real-time</h3>
        <DataTable
          data={conversionEvents}
          columns={columns}
          searchPlaceholder="Cari event log..."
          exportFilename="realtime-event-conversions"
        />
      </div>
    </div>
  );
}
