"use client";

import React from "react";
import useSWR from "swr";
import { StockService } from "@/services/inventory";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { StockMovement } from "@/types";

export default function StockMovementsPage() {
  const { data: movementsRes, isLoading } = useSWR("stockMovementsList", () =>
    StockService.getMovements()
  );
  const movements = movementsRes?.data?.items || [];

  const columns: Column<StockMovement>[] = [
    {
      header: "Tanggal",
      accessor: (row) =>
        row.date
          ? new Date(row.date).toLocaleString("id-ID")
          : "-",
      sortKey: "date",
    },
    { header: "ID Produk", accessor: "productId", sortKey: "productId" },
    {
      header: "Tipe Mutasi",
      accessor: (row) => {
        let colors = "bg-slate-500/10 text-slate-500 border border-slate-500/20";
        if (row.type === "IN") {
          colors = "bg-green-500/10 text-green-600 border border-green-500/20";
        } else if (row.type === "OUT") {
          colors = "bg-red-500/10 text-red-500 border border-red-500/20";
        } else if (row.type === "ADJ") {
          colors = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
        }
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors}`}>
            {row.type}
          </span>
        );
      },
      sortKey: "type",
    },
    {
      header: "Jumlah Qty",
      accessor: (row) => (
        <span className="font-bold font-mono text-[var(--text-heading)]">
          {row.qty > 0 ? `+${row.qty}` : row.qty}
        </span>
      ),
      sortKey: "qty",
    },
    { header: "Catatan / Keterangan", accessor: "note" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/inventory"
          className="p-2 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-body)]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Buku Ledger Mutasi Stok
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Riwayat log keluar-masuk barang, penjualan kasir, opname, dan pembelian supplier.
          </p>
        </div>
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={movements}
          columns={columns}
          searchFields={["productId", "type", "note"]}
          searchPlaceholder="Cari berdasarkan ID produk / catatan..."
          exportFilename="mutasi-stok-gudang"
        />
      )}
    </div>
  );
}
