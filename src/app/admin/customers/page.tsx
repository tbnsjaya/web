"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { CustomerService } from "@/services/customers";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Loader2, Users } from "lucide-react";
import type { Customer } from "@/types";

const customerSchema = z.object({
  name: z.string().min(3, "Nama pelanggan minimal 3 karakter"),
  phone: z.string().min(5, "Nomor telepon minimal 5 digit"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  type: z.enum(["umum", "member"]),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersAdminPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customersRes, mutate, isLoading } = useSWR("adminCustomers", () =>
    CustomerService.getAll()
  );
  const customers = customersRes?.data?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "", address: "", type: "umum" },
  });

  const handleOpenCreate = () => {
    reset({ name: "", phone: "", address: "", type: "umum" });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    reset({
      name: cust.name,
      phone: cust.phone,
      address: cust.address,
      type: cust.type,
    });
    setEditingId(cust.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) return;

    try {
      const res = await CustomerService.delete(id);
      if (res.success) {
        toast.success("Pelangan berhasil dihapus!");
        mutate();
      } else {
        toast.error(res.message || "Gagal menghapus pelanggan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  const onSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await CustomerService.update(editingId, values);
      } else {
        res = await CustomerService.create(values);
      }

      if (res.success) {
        toast.success(editingId ? "Pelanggan berhasil diperbarui!" : "Pelanggan berhasil ditambahkan!");
        mutate();
        setIsOpen(false);
      } else {
        toast.error(res.message || "Gagal menyimpan pelanggan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Import handler
  const handleImport = async (rows: any[]) => {
    let successCount = 0;
    for (const row of rows) {
      if (!row.name || !row.phone || !row.address) continue;
      try {
        const type = row.type === "member" ? "member" : "umum";
        await CustomerService.create({
          name: row.name,
          phone: row.phone,
          address: row.address,
          type,
        });
        successCount++;
      } catch {
        // Continue
      }
    }
    toast.success(`${successCount} pelanggan berhasil diimport!`);
    mutate();
  };

  const columns: Column<Customer>[] = [
    { header: "Nama Pelanggan", accessor: "name", sortKey: "name" },
    { header: "Nomor Telepon", accessor: "phone", sortKey: "phone" },
    { header: "Alamat", accessor: "address" },
    {
      header: "Tipe",
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
            row.type === "member"
              ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
              : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
          }`}
        >
          {row.type}
        </span>
      ),
      sortKey: "type",
    },
    {
      header: "Aksi",
      accessor: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 border border-[var(--border)] hover:bg-red-500/10 rounded text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
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
            Daftar Pelanggan (CRM)
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Daftar pelanggan umum maupun member TB NS Jaya.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={customers}
          columns={columns}
          searchFields={["name", "phone", "address"]}
          searchPlaceholder="Cari pelanggan..."
          onImport={handleImport}
          exportFilename="pelanggan-tbnsjaya"
        />
      )}

      {/* Create/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--border-muted)]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">
                  {editingId ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--color-slate-200)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Utomo"
                  {...register("name")}
                  className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                    errors.name ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                  }`}
                />
                {errors.name && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Nomor Handphone
                </label>
                <input
                  type="text"
                  placeholder="085123456789"
                  {...register("phone")}
                  className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                    errors.phone ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                  }`}
                />
                {errors.phone && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Tipe Pelanggan
                </label>
                <select
                  {...register("type")}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] border-[var(--border)] font-semibold"
                >
                  <option value="umum">Umum (Ritel Standar)</option>
                  <option value="member">Member (Kontraktor / Langganan)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Alamat Rumah / Kantor
                </label>
                <textarea
                  rows={3}
                  placeholder="Alamat lengkap pengiriman barang..."
                  {...register("address")}
                  className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                    errors.address ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                  }`}
                />
                {errors.address && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-[var(--border)] mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
