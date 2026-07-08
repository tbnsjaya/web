"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Upload, Loader2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortKey?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  onImport?: (parsedRows: any[]) => Promise<void>;
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Cari data...",
  searchFields = [],
  onImport,
  exportFilename = "data-export",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isImporting, setIsImporting] = useState(false);

  // Sorting Handler
  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(key);
      setSortOrder("asc");
    }
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery && searchFields.length > 0) {
      result = result.filter((row) =>
        searchFields.some((field) => {
          const val = row[field];
          return val ? val.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false;
        })
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField as keyof T];
        const valB = b[sortField as keyof T];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        const stringA = valA.toString().toLowerCase();
        const stringB = valB.toString().toLowerCase();

        // Check if numeric
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }

        if (stringA < stringB) return sortOrder === "asc" ? -1 : 1;
        if (stringA > stringB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchFields, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // Export to CSV/Excel
  const handleExport = () => {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diexport!");
      return;
    }

    const headers = columns.map((c) => c.header).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = typeof c.accessor === "function" ? "" : row[c.accessor];
          const cleanVal = val !== undefined && val !== null ? String(val).replace(/"/g, '""') : "";
          return `"${cleanVal}"`;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFilename}-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data berhasil diexport!");
  };

  // Import CSV/Excel parser
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.length < 2) {
          toast.error("Format CSV tidak valid!");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
        const parsedRows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.replace(/^["']|["']$/g, "").trim());
          const obj: Record<string, any> = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx] || "";
          });
          return obj;
        });

        await onImport(parsedRows);
        toast.success("Data berhasil diimport!");
      } catch (err: any) {
        toast.error(err.message || "Gagal mengimport file");
      } finally {
        setIsImporting(false);
        e.target.value = ""; // Reset
      }
    };
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {onImport && (
            <label className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-[var(--surface)] hover:bg-[var(--color-slate-100)] border border-[var(--border)] text-[var(--text-body)] text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transition-colors">
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Import</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImport}
                disabled={isImporting}
              />
            </label>
          )}

          <button
            onClick={handleExport}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-[var(--surface)] hover:bg-[var(--color-slate-100)] border border-[var(--border)] text-[var(--text-body)] text-xs font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--border-muted)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`p-4 ${col.sortKey ? "cursor-pointer select-none hover:text-[var(--text-heading)]" : ""}`}
                    onClick={() => col.sortKey && handleSort(col.sortKey)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col.header}</span>
                      {col.sortKey && <ArrowUpDown className="w-3.5 h-3.5" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-body)] font-medium">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[var(--border-muted)]/50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="p-4">
                        {typeof col.accessor === "function"
                          ? col.accessor(row)
                          : row[col.accessor as string]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-[var(--text-muted)]">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--border-muted)]/50 text-xs">
          <div className="flex items-center space-x-2 text-[var(--text-muted)]">
            <span>Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dari {processedData.length} entri</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[var(--border)] rounded bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-body)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[var(--text-heading)]">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-[var(--border)] rounded bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-body)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
