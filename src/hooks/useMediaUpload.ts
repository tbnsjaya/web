"use client";

import { useState, useCallback } from "react";
import { MediaService } from "@/services/media";
import type { Media } from "@/types";

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<Media | null> => {
    setIsUploading(true);
    setError(null);
    try {
      const base64Data = await convertToBase64(file);
      const res = await MediaService.upload(file.name, base64Data, file.type);
      if (res.success && res.data) {
        return res.data;
      } else {
        setError(res.message || "Gagal mengunggah media");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses file");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    error,
  };
}

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract only base64 string excluding data:*/*;base64,
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}
