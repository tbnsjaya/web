"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { DebtService } from "@/services/debt";
import { DataTable, Column } from "@/components/ui/DataTable";
import { toast } from "sonner";
import {
  DollarSign,
  Loader2,
  Send,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Building
} from "lucide-react";
import type { SupplierDebt } from "@/types";

export default function SupplierDebtsAdminPage() {
  const { data: debtRes, mutate, isLoading } = useSWR("adminDebtList", () =>
    DebtService.getAll()
  );
  const debts = debtRes?.data?.items || [];

  // Local state
  const [selectedDebt, setSelectedDebt] = useState<SupplierDebt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // KPIs
  const kpis = useMemo(() => {
    const outstanding = debts.reduce((acc, d) => acc + (d.status !== "paid" ? d.amount : 0), 0);
    const paidCount = debts.filter((d) => d.status === "paid").length;
    const unpaidCount = debts.filter((d) => d.status !== "paid").length;

    return { outstanding, paidCount, unpaidCount };
  }, [debts]);

  // Simulate Telegram Send
  const handleTelegramReminder = (debt: SupplierDebt) => {
    toast.success(`Pengingat Tanggal Jatuh Tempo dikirim ke Telegram Owner: Rp ${debt.amount.toLocaleString("id-ID")}`);
  };

  // Repayment submit
  const handleRepaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || paymentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await DebtService.pay({
        supplierDebtId: selectedDebt.id,
        amount: paymentAmount,
      });

      if (res.success) {
        toast.success(`Pembayaran utang Rp ${paymentAmount.toLocaleString("id-ID")} berhasil dicatat!`);
        
        // Simulating Telegram Notification to Channel
        toast.info("Notifikasi pembayaran terkirim ke Telegram Channel Owner!");

        mutate();
        setSelectedDebt(null);
        setPaymentAmount(0);
      } else {
        toast.error(res.message || "Gagal mencatat pembayaran");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side PDF print list
  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `
      <html>
        <head>
          <title>Laporan Utang Supplier</title>
          <style>
            body { font-family: sans-serif; font-size: 12px; margin: 30px; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 20px; }
            table { wIdth: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solId #ccc; padding: 8px; text-align: left; }
            th { bg-color: #f2f2f2; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body onload="window.print();">
          <h1>LAPORAN KEWAJIBAN UTANG SUPPLIER</h1>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Original Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    debts.forEach((d) => {
      html += `
        <tr>
          <td>${d.supplierId}</td>
          <td>Rp ${d.amount.toLocaleString("id-ID")}</td>
          <td>${d.dueDate ? new Date(d.dueDate).toLocaleDateString("id-ID") : "-"}</td>
          <td>${d.status.toUpperCase()}</td>
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

  const columns: Column<SupplierDebt>[] = [
    { header: "ID Utang / Ref", accessor: "id", sortKey: "id" },
    { header: "ID Supplier", accessor: "supplierId", sortKey: "supplierId" },
    {
      header: "Jumlah Utang",
      accessor: (row) => `Rp ${row.amount.toLocaleString("id-ID")}`,
      sortKey: "amount",
    },
    {
      header: "Tanggal Jatuh Tempo",
      accessor: (row) =>
        row.dueDate
          ? new Date(row.dueDate).toLocaleDateString("id-ID")
          : "-",
      sortKey: "dueDate",
    },
    {
      header: "Status",
      accessor: (row) => {
        let style = "bg-red-500/10 text-red-500 border border-red-500/20";
        if (row.status === "paid") {
          style = "bg-green-500/10 text-green-600 border border-green-500/20";
        } else if (row.status === "partial") {
          style = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
        }
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style}`}>
            {row.status}
          </span>
        );
      },
      sortKey: "status",
    },
    {
      header: "Aksi",
      accessor: (row) => (
        <div className="flex space-x-2">
          {row.status !== "paid" && (
            <button
              onClick={() => setSelectedDebt(row)}
              className="p-1.5 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer text-[10px] font-bold flex items-center space-x-1"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bayar Sebagian</span>
            </button>
          )}
          <button
            onClick={() => handleTelegramReminder(row)}
            className="p-1.5 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded text-[var(--text-muted)] hover:text-blue-500 cursor-pointer text-[10px] font-bold flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reminder</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Kewajiban Utang Supplier
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Daftar payables pembelian tempo supplier, pencatatan pembayaran sebagian, dan jatuh tempo.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintPDF}
            className="bg-[var(--surface)] hover:bg-[var(--color-slate-100)] border border-[var(--border)] text-[var(--text-body)] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Utang Outstanding</h3>
            <p className="font-heading font-black text-xl text-red-500">
              Rp {kpis.outstanding.toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] text-[var(--text-muted)]">Belum lunas berjalan</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Utang Lunas</h3>
            <p className="font-heading font-black text-xl text-green-500">{kpis.paidCount} Transaksi</p>
            <span className="text-[10px] text-green-500 font-semibold">Telah lunas dibayar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Utang Outstanding</h3>
            <p className="font-heading font-black text-xl text-amber-500">{kpis.unpaidCount} Transaksi</p>
            <span className="text-[10px] text-amber-500 font-semibold">Menunggu pelunasan</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={debts}
          columns={columns}
          searchFields={["id", "supplierId", "status"]}
          searchPlaceholder="Cari utang..."
          exportFilename="payables-supplier-debt"
        />
      )}

      {/* Repayment Modal */}
      {selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--border-muted)]">
              <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">
                Catat Pembayaran Utang
              </h3>
              <button
                onClick={() => setSelectedDebt(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-slate-200)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRepaymentSubmit} className="p-5 space-y-4">
              <div className="space-y-2 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">ID Supplier:</span>
                  <span className="font-bold text-[var(--text-heading)]">{selectedDebt.supplierId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Original Debt:</span>
                  <span className="font-bold text-[var(--text-heading)]">
                    Rp {selectedDebt.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Nominal Pembayaran Utang (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="500000"
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-[var(--border)] mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedDebt(null)}
                  className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || paymentAmount <= 0}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  <span>Proses Bayar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
