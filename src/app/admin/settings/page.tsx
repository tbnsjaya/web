"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { SettingsService } from "@/services/settings";
import { MediaPicker } from "@/components/cms/MediaPicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Settings,
  Save,
  Loader2,
  Image as ImageIcon,
  Globe,
  PhoneCall,
  Tv,
  Search
} from "lucide-react";
import type { WebsiteSettings } from "@/types";

const settingsSchema = z.object({
  companyName: z.string().min(3, "Nama perusahaan minimal 3 karakter"),
  logoUrl: z.string().min(1, "Logo URL wajib diisi"),
  operationalHours: z.string().min(1, "Jam operasional wajib diisi"),
  waNumber: z.string().min(10, "WhatsApp number minimal 10 digit"),
  email: z.string().email("Format email tidak valid"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  gmapsUrl: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function WebsiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "banners" | "contact" | "seo">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"logo" | "banner">("logo");

  const { data: settingsRes, mutate, isLoading } = useSWR("websiteSettings", () =>
    SettingsService.getWebsite()
  );
  const settings = settingsRes?.data;

  // Manage banners and SEO mock fields (stored locally or updated optimistically)
  const [bannerUrl, setBannerUrl] = useState("https://picsum.photos/1200/400");
  const [promoText, setPromoText] = useState("Diskon Pembelian Grosir Sampai 15%!");
  const [metaTitle, setMetaTitle] = useState("TB NS Jaya - Toko Bahan Bangunan Terlengkap Lumajang");
  const [metaDesc, setMetaDesc] = useState("Penyedia material semen, besi beton, cat, keramik, dan baja ringan murah Lumajang Pasirian.");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  // Pre-load form defaults when data is loaded
  React.useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        operationalHours: settings.operationalHours,
        waNumber: settings.waNumber,
        email: settings.email,
        address: settings.address,
        gmapsUrl: settings.gmapsUrl || "",
      });
    }
  }, [settings, reset]);

  const watchLogoUrl = watch("logoUrl");

  const handleOpenMediaPicker = (target: "logo" | "banner") => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === "logo") {
      setValue("logoUrl", url, { shouldValidate: true });
    } else {
      setBannerUrl(url);
    }
    setIsMediaPickerOpen(false);
  };

  const onSubmit = async (values: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await SettingsService.updateWebsite(values);
      if (res.success) {
        toast.success("Pengaturan website berhasil diperbarui!");
        mutate();
      } else {
        toast.error(res.message || "Gagal memperbarui pengaturan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)] flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[var(--primary)]" />
            <span>Pengaturan Website &amp; Customizer</span>
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Konfigurasi profil usaha, nomor kontak, metadata SEO, slider banner promosi, dan logo.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-[var(--border)] scrollbar-thin">
        {[
          { key: "general", label: "Profil Umum", icon: Globe },
          { key: "banners", label: "Banner & Promo", icon: Tv },
          { key: "contact", label: "Kontak & Lokasi", icon: PhoneCall },
          { key: "seo", label: "SEO Metadata", icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-body)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* TAB 1: General Profile */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xs text-[var(--text-heading)] uppercase tracking-wider">Profil Dasar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Nama Toko / Perusahaan
                  </label>
                  <input
                    type="text"
                    {...register("companyName")}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold ${
                      errors.companyName ? "border-red-500" : "border-[var(--border)]"
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Operational Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    placeholder="Senin - Sabtu: 07.00 - 16.00"
                    {...register("operationalHours")}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                  />
                </div>

                {/* Logo Uploader */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Logo Website
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded border border-[var(--border)] bg-[var(--background)] overflow-hidden flex items-center justify-center">
                      {watchLogoUrl ? (
                        <img src={watchLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[var(--text-disabled)]" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker("logo")}
                      className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] text-xs font-bold py-2 px-3 rounded border border-[var(--border)] cursor-pointer"
                    >
                      Pilih Logo Dari Media
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Banners & Promos */}
          {activeTab === "banners" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xs text-[var(--text-heading)] uppercase tracking-wider">Homepage Banner Slider</h3>

              <div className="space-y-4">
                {/* Banner Preview */}
                <div className="w-full aspect-[3/1] rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden relative flex items-center justify-center">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[var(--text-disabled)]" />
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white p-3 rounded text-xs max-w-xs leading-relaxed">
                    <p className="font-bold">Caption Promosi:</p>
                    <p className="italic">{promoText}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Banner Image */}
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">Gambar Banner Utama</label>
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker("banner")}
                      className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] text-xs font-bold py-2.5 px-4 rounded border border-[var(--border)] cursor-pointer text-center"
                    >
                      Pilih Gambar Banner
                    </button>
                  </div>

                  {/* Promo Caption text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Teks Headline Promosi
                    </label>
                    <input
                      type="text"
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Contact & Locations */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xs text-[var(--text-heading)] uppercase tracking-wider">Kontak &amp; Google Maps</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Email Kontak Resmi
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold ${
                      errors.email ? "border-red-500" : "border-[var(--border)]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Nomor WhatsApp Admin POS
                  </label>
                  <input
                    type="text"
                    {...register("waNumber")}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold ${
                      errors.waNumber ? "border-red-500" : "border-[var(--border)]"
                    }`}
                  />
                  {errors.waNumber && (
                    <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.waNumber.message}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Alamat Lengkap Toko Fisik
                  </label>
                  <textarea
                    rows={2}
                    {...register("address")}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold ${
                      errors.address ? "border-red-500" : "border-[var(--border)]"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.address.message}</p>
                  )}
                </div>

                {/* Google Maps Coordinates / Link */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    URL Google Maps Frame (Embed)
                  </label>
                  <input
                    type="text"
                    {...register("gmapsUrl")}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO Metadata */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xs text-[var(--text-heading)] uppercase tracking-wider">SEO Search Engine Optimization</h3>

              <div className="space-y-4">
                {/* Meta Title Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Meta Title Tag Default
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                    Meta Description Default
                  </label>
                  <textarea
                    rows={3}
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-4 border-t border-[var(--border)] mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
