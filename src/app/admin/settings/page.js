'use client';

import { useState } from 'react';
import useStore from '@/lib/store';
import { uploadImageToDrive } from '@/lib/api';
import { Settings, Save, QrCode, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [bankDetails, setBankDetails] = useState(settings?.bankDetails || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with settings when loaded
  useState(() => {
    if (settings?.bankDetails) {
      setBankDetails(settings.bankDetails);
    }
  });

  const handleQrisUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const max = 600; // max size

        if (w > h && w > max) { h *= max / w; w = max; }
        else if (h > max) { w *= max / h; h = max; }

        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);

        try {
          const url = await uploadImageToDrive(base64, 'qris_settings.jpg', 'image/jpeg');
          updateSettings({ qrisImage: url });
          toast.success('QRIS berhasil diunggah dan disimpan!');
        } catch (err) {
          toast.error('Gagal mengunggah QRIS');
        } finally {
          setIsUploading(false);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({ bankDetails });
      toast.success('Pengaturan bank berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Pengaturan Toko</h2>
          <p className="text-sm text-slate-400">Atur metode pembayaran QRIS dan Rekening Bank untuk Kasir</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* QRIS Settings */}
        <div className="space-y-3">
          <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <QrCode className="w-4 h-4" /> QRIS Toko
          </h3>
          <p className="text-xs text-slate-400">Unggah gambar kode QRIS toko Anda agar muncul otomatis saat kasir memilih pembayaran QRIS.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrisUpload}
                disabled={isUploading}
                id="qris-upload"
                className="hidden"
              />
              <label
                htmlFor="qris-upload"
                className="px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors cursor-pointer border border-indigo-200/40 dark:border-indigo-950 flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...</>
                ) : (
                  'Pilih & Unggah QRIS'
                )}
              </label>
            </div>
            
            {settings?.qrisImage && (
              <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800">
                <img
                  src={settings.qrisImage}
                  alt="QRIS Toko"
                  className="h-28 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Bank Settings */}
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-4 h-4" /> Rekening Bank Transfer
          </h3>
          <p className="text-xs text-slate-400">Tulis detail rekening bank toko Anda agar kasir bisa menunjukkannya kepada pembeli saat membayar dengan transfer.</p>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Detail Bank (Format bebas)</label>
            <textarea
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="Contoh:&#10;BCA - 1234567890 - a.n TB NS Jaya&#10;Mandiri - 9876543210 - a.n TB NS Jaya"
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200 dark:border-slate-700 outline-none transition-all resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-all btn-press flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
