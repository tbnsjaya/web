"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  FileSpreadsheet,
  PlusCircle,
  ClipboardList,
  CheckCircle,
  Truck,
  Loader2,
  TrendingDown
} from "lucide-react";

export default function WarehouseDashboardPage() {
  const { user } = useAuth();

  // Fetch products
  const { data: productsRes, isLoading } = useSWR("adminProducts", () =>
    ProductService.getAll()
  );
  const products = productsRes?.data?.items || [];

  // KPIs Calculations
  const kpis = useMemo(() => {
    const totalItems = products.length;
    const outOfStock = products.filter((p) => (p.currentStock || 0) <= 0).length;
    const lowStock = products.filter((p) => {
      const stock = p.currentStock || 0;
      return stock > 0 && stock < 10;
    }).length;

    // Estimate asset values: sum of (buyPrice * currentStock)
    const totalValue = products.reduce((acc, p) => acc + (p.buyPrice * (p.currentStock || 0)), 0);

    return { totalItems, outOfStock, lowStock, totalValue };
  }, [products]);

  // Reorder Recommendation: products with currentStock < 10
  const recommendations = useMemo(() => {
    return products
      .filter((p) => (p.currentStock || 0) < 10)
      .map((p) => {
        const current = p.currentStock || 0;
        const target = 50; // Safety stock level target
        const recommendQty = target - current;
        return {
          ...p,
          recommendQty,
        };
      });
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Dashboard Gudang (Inventory)
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Manajemen stok material, tingkat persediaan minimum, dan rekomendasi pemesanan ulang.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/inventory/opname"
            className="bg-[var(--surface)] hover:bg-[var(--color-slate-100)] border border-[var(--border)] text-[var(--text-body)] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Stock Opname</span>
          </Link>
          <Link
            href="/admin/purchases/create"
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Pembelian</span>
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Varian */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Item Produk</h3>
                <p className="font-heading font-black text-xl text-[var(--text-heading)]">{kpis.totalItems} Varian</p>
                <span className="text-[10px] text-[var(--text-muted)]">Terdaftar di katalog</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Nilai Aset */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Nilai Aset Stok</h3>
                <p className="font-heading font-black text-xl text-[var(--text-heading)]">
                  Rp {kpis.totalValue.toLocaleString("id-ID")}
                </p>
                <span className="text-[10px] text-green-500 font-semibold">Total harga beli</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Peringatan Menipis</h3>
                <p className="font-heading font-black text-xl text-amber-500">{kpis.lowStock} Item</p>
                <span className="text-[10px] text-amber-500 font-semibold">Stok &lt; 10 unit</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Habis / Kosong</h3>
                <p className="font-heading font-black text-xl text-red-500">{kpis.outOfStock} Item</p>
                <span className="text-[10px] text-red-500 font-semibold">Harus segera order</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recommendations & History Link */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Reorder Recommendation (Col span 2) */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] flex items-center space-x-1.5">
                <Truck className="w-4.5 h-4.5 text-[var(--primary)]" />
                <span>Rekomendasi Reorder Supplier</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Rekomendasi otomatis jumlah pembelian ulang untuk mengembalikan stok barang ke level aman (Target Safety Stock: 50 unit).
              </p>

              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[var(--border-muted)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase">
                    <tr>
                      <th className="p-3">Nama Produk</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-center">Stok Saat Ini</th>
                      <th className="p-3 text-center">Rekomendasi Order</th>
                      <th className="p-3 text-right">Estimasi Biaya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-[var(--text-body)]">
                    {recommendations.length > 0 ? (
                      recommendations.slice(0, 10).map((rec) => (
                        <tr key={rec.id} className="hover:bg-[var(--border-muted)]/40 transition-colors">
                          <td className="p-3 font-bold text-[var(--text-heading)]">{rec.name}</td>
                          <td className="p-3 font-mono text-[10px] text-[var(--text-muted)]">{rec.sku}</td>
                          <td className="p-3 text-center font-bold">
                            <span className={rec.currentStock === 0 ? "text-red-500" : "text-amber-500"}>
                              {rec.currentStock} {rec.unit}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-orange-500/10 text-[var(--primary)] font-extrabold px-2 py-0.5 rounded font-mono">
                              +{rec.recommendQty}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-[var(--text-heading)]">
                            Rp {(rec.recommendQty * rec.buyPrice).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[var(--text-muted)] font-semibold">
                          Seluruh stok produk berada dalam batas aman.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Quick Action & Links */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">Aksi &amp; Log Audit</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Akses cepat ke berkas pelaporan, penyesuaian opname secara manual, dan peninjauan riwayat mutasi stok.
              </p>

              <div className="space-y-3">
                <Link
                  href="/admin/inventory/movements"
                  className="block w-full text-center bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg py-3.5 px-4 text-xs font-bold text-[var(--text-heading)] transition-colors cursor-pointer"
                >
                  Lihat Riwayat Mutasi (Ledger)
                </Link>
                <Link
                  href="/admin/inventory/opname"
                  className="block w-full text-center bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg py-3.5 px-4 text-xs font-bold text-[var(--text-heading)] transition-colors cursor-pointer"
                >
                  Pencatatan Penyesuaian Stok
                </Link>
                <Link
                  href="/admin/purchases"
                  className="block w-full text-center bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] rounded-lg py-3.5 px-4 text-xs font-bold text-[var(--text-heading)] transition-colors cursor-pointer"
                >
                  Log Pembelian Barang
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
