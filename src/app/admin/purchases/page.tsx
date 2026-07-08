"use client";

import React from "react";
import useSWR from "swr";
import { PurchaseService } from "@/services/purchases";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Plus, Loader2, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import type { Purchase } from "@/types";

export default function PurchasesPage() {
  const { data: purchasesRes, isLoading } = useSWR("adminPurchasesList", () =>
    PurchaseService.getAll()
  );
  const purchases = purchasesRes?.data?.items || [];

  const columns: Column<Purchase>[] = [
    { header: "Nomor PO / Nota", accessor: "poNumber", sortKey: "poNumber" },
    { header: "Supplier ID", accessor: "supplierId", sortKey: "supplierId" },
    {
      header: "Tanggal Pembelian",
      accessor: (row) =>
        row.date
          ? new Date(row.date).toLocaleDateString("id-ID")
          : "-",
      sortKey: "date",
    },
    {
      header: "Total Pembelian",
      accessor: (row) => `Rp ${row.total.toLocaleString("id-ID")}`,
      sortKey: "total",
    },
    {
      header: "Status Pembayaran",
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            row.status === "lunas"
              ? "bg-green-500/10 text-green-600 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {row.status}
        </span>
      ),
      sortKey: "status",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)] flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-[var(--primary)]" />
            <span>Riwayat Pembelian Stok (PO)</span>
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Daftar pembelian barang ke supplier distributor dan status tagihan.
          </p>
        </div>
        <Link
          href="/admin/purchases/create"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Buat PO Baru</span>
        </Link>
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={purchases}
          columns={columns}
          searchFields={["poNumber", "supplierId", "status"]}
          searchPlaceholder="Cari PO / supplier..."
          exportFilename="pembelian-stok-gudang"
        />
      )}
    </div>
  );
}
