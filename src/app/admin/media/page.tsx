"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { MediaService } from "@/services/media";
import { toast } from "sonner";
import {
  Upload,
  Search,
  Trash2,
  Image as ImageIcon,
  Loader2,
  FolderOpen,
  FileText,
  Copy,
  ExternalLink
} from "lucide-react";
import type { Media } from "@/types";

export default function MediaLibraryPage() {
  const { data: mediaRes, mutate, isLoading } = useSWR("adminMediaList", () =>
    MediaService.getAll()
  );
  const mediaFiles = mediaRes?.data?.items || [];

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Search filter
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return mediaFiles;
    return mediaFiles.filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mediaFiles, searchTerm]);

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        const res = await MediaService.upload(file.name, base64Data, file.type);
        if (res.success) {
          toast.success("Berkas berhasil diupload ke Media Library!");
          mutate();
        } else {
          toast.error(res.message || "Gagal mengupload berkas");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan sistem");
      } finally {
        setIsUploading(false);
      }
    };
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus berkas ini?")) return;

    try {
      const res = await MediaService.delete(id);
      if (res.success) {
        toast.success("Berkas berhasil dihapus dari perpustakaan!");
        mutate();
      } else {
        toast.error(res.message || "Gagal menghapus berkas");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  // Copy URL Helper
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.info("Tautan berkas disalin ke clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)] flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-[var(--primary)]" />
            <span>Media Library Explorer</span>
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Kelola berkas media, gambar promosi, aset produk, dan lampiran website.
          </p>
        </div>

        {/* Upload Button */}
        <label className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer w-full sm:w-auto">
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>Unggah Berkas</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari berkas berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          />
        </div>
        <div className="text-xs text-[var(--text-muted)] font-semibold">
          Menampilkan {filteredFiles.length} berkas media
        </div>
      </div>

      {/* Grid Explorer */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col justify-between shadow-sm group hover:border-[var(--primary)] transition-all animate-in fade-in duration-200"
            >
              {/* Preview Box */}
              <div className="aspect-square bg-[var(--background)] flex items-center justify-center relative overflow-hidden border-b border-[var(--border-muted)]">
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-[var(--text-disabled)]" />
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                  <button
                    onClick={() => handleCopyLink(file.url)}
                    className="p-1.5 bg-white/90 hover:bg-white text-[var(--text-body)] rounded-lg shadow cursor-pointer transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/90 hover:bg-white text-[var(--text-body)] rounded-lg shadow cursor-pointer transition-colors"
                    title="Open Original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow cursor-pointer transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filename Footer */}
              <div className="p-3 text-center">
                <p className="text-[10px] font-bold text-[var(--text-heading)] truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <span className="text-[8px] text-[var(--text-muted)] font-mono uppercase tracking-wider block mt-0.5">
                  {file.type.split("/")[1] || "file"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-12 text-center">
          <FolderOpen className="w-12 h-12 text-[var(--text-disabled)] mx-auto mb-3" />
          <p className="text-xs text-[var(--text-muted)] font-semibold">Media Library kosong. Upload gambar pertamamu!</p>
        </div>
      )}
    </div>
  );
}
