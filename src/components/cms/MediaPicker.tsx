"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { MediaService } from "@/services/media";
import { Image as ImageIcon, X, Upload, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { data: mediaRes, mutate } = useSWR(isOpen ? "mediaList" : null, () =>
    MediaService.getAll()
  );
  const mediaItems = mediaRes?.data?.items || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan!");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        // Strip data:image/...;base64,
        const base64Clean = base64Data.split(",")[1];
        
        const uploadRes = await MediaService.upload(file.name, base64Clean, file.type);
        if (uploadRes.success && uploadRes.data) {
          toast.success("Gambar berhasil diunggah!");
          mutate(); // Reload list
        } else {
          toast.error(uploadRes.message || "Gagal mengunggah gambar");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan saat mengunggah");
      } finally {
        setIsUploading(false);
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--border-muted)]">
          <div className="flex items-center space-x-2.5">
            <ImageIcon className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="font-heading text-base font-bold text-[var(--text-heading)]">
              Media Library &amp; Picker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-slate-200)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload bar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            Pilih gambar dari perpustakaan media di bawah atau unggah gambar baru dari perangkat Anda.
          </p>
          <label className="flex items-center space-x-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-colors">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? "Mengunggah..." : "Unggah Gambar"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {mediaItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative aspect-square bg-[var(--background)] border border-[var(--border)] rounded-lg overflow-hidden cursor-pointer hover:border-[var(--primary)] hover:shadow transition-all"
                >
                  <img
                    src={item.url}
                    alt={item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ImageIcon className="w-12 h-12 text-[var(--text-disabled)]" />
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-heading)]">Pustaka Media Kosong</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Unggah file gambar pertama Anda untuk memulai memilih.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
