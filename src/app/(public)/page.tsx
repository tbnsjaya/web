"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ProductService } from "@/services/products";
import { CategoryService } from "@/services/categories";
import { BlogService } from "@/services/blog";
import { gasRequest } from "@/services/api/request";
import type { Product, Category, Blog, Banner, Promotion } from "@/types";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  Building2,
  CheckCircle2,
  Calendar,
  User,
  Star
} from "lucide-react";

export default function PublicHomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Fetch banners
  const { data: bannersRes, error: bannersErr } = useSWR("publicBanners", () =>
    gasRequest<Banner[]>("getBanners")
  );
  const banners = bannersRes?.data?.filter((b) => b.isActive) || [];

  // Fetch promotions
  const { data: promosRes } = useSWR("publicPromos", () =>
    gasRequest<Promotion[]>("getPromotions")
  );
  const promotions = promosRes?.data?.filter((p) => p.isActive) || [];

  // Fetch categories
  const { data: categoriesRes } = useSWR("publicCategories", () =>
    CategoryService.getAll({ page: 1, perPage: 12 })
  );
  const categories = categoriesRes?.data?.items || [];

  // Fetch products (for Featured and Newest)
  const { data: productsRes, isLoading: isProductsLoading } = useSWR("publicProducts", () =>
    ProductService.getAll({ page: 1, perPage: 12 })
  );
  const products = productsRes?.data?.items || [];

  // Filter Featured (buyPrice > 50k or sellPrice > 100k or just slice first 4)
  const featuredProducts = products.slice(0, 4);
  // Sort Newest
  const newestProducts = [...products].reverse().slice(0, 4);

  // Fetch blogs
  const { data: blogsRes, isLoading: isBlogsLoading } = useSWR("publicBlogs", () =>
    BlogService.getAll({ page: 1, perPage: 3, publishedOnly: true })
  );
  const blogs = blogsRes?.data?.items || [];

  // WhatsApp helper
  const phoneNum = "6282330449041";
  const defaultMsg = "Halo TB NS Jaya, saya tertarik memesan produk di toko Anda. Bisa diinfokan caranya?";
  const waLink = `https://wa.me/${phoneNum}?text=${encodeURIComponent(defaultMsg)}`;

  // FAQ mock data
  const faqs = [
    {
      q: "Bagaimana cara melakukan pemesanan material di TB NS Jaya?",
      a: "Anda dapat memesan secara langsung dengan mengunjungi gerai kami, atau melalui tombol WhatsApp di website ini. Tim kami akan mengonfirmasi ketersediaan barang dan biaya pengiriman."
    },
    {
      q: "Apakah TB NS Jaya melayani jasa kirim sampai ke lokasi proyek?",
      a: "Ya, kami memiliki armada pengiriman sendiri yang siap mengantarkan material bangunan Anda langsung ke lokasi proyek dengan tarif yang kompetitif."
    },
    {
      q: "Apakah ada diskon atau promo khusus untuk pembelian partai besar?",
      a: "Tentu saja! Untuk kontraktor, pembangun proyek, atau pembelian grosir material dalam volume besar, kami menyediakan harga khusus dan promo diskon penawaran menarik."
    },
    {
      q: "Metode pembayaran apa saja yang diterima?",
      a: "Kami menerima pembayaran tunai (cash), transfer bank, serta kasbon dengan tempo bagi pelanggan loyal yang sudah terverifikasi (member)."
    }
  ];

  const partners = [
    "Semen Indonesia",
    "Holcim",
    "Mulia Ceramics",
    "Tiga Roda",
    "Roman Granite",
    "Vinilex Paints"
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ==========================================
          1. HERO SECTION (Dynamic Slider / Banner)
          ========================================== */}
      <section className="relative h-[550px] md:h-[650px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Banner Image Background (or placeholder) */}
        {banners.length > 0 ? (
          <div className="absolute inset-0 z-0">
            <img
              src={banners[0].imageUrl}
              alt={banners[0].title}
              className="w-full h-full object-cover opacity-35"
              loading="eager"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/20 opacity-90 z-0" />
        )}
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)] opacity-5 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 text-[var(--primary)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>Distributor Resmi Material Konstruksi</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight max-w-4xl mx-auto"
          >
            Membangun Masa Depan Dengan <span className="text-[var(--primary)]">Material Kokoh</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Penyedia semen, pasir, besi beton, cat, keramik, dan alat teknik terlengkap di Lumajang dengan layanan prima dan pengiriman cepat langsung ke proyek Anda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <Link
              href="/products"
              className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold px-8 py-4 rounded-[var(--radius-md)] shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <span>Jelajahi Produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-[var(--radius-md)] transition-all flex items-center justify-center space-x-2"
            >
              <span>Hubungi Sales</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          2. PROMO BANNER (Google Apps Script API)
          ========================================== */}
      {promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-[var(--radius-xl)] p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
            <div className="relative z-10 space-y-3">
              <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Penawaran Spesial Terbatas
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-black tracking-tight">
                {promotions[0].name}
              </h2>
              <p className="text-sm text-orange-100 max-w-xl">
                Dapatkan diskon eksklusif untuk setiap pemesanan. Promo berlangsung mulai tanggal {new Date(promotions[0].startDate).toLocaleDateString("id-ID")} hingga {new Date(promotions[0].endDate).toLocaleDateString("id-ID")}.
              </p>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 w-full md:w-auto bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 rounded-[var(--radius-md)] text-center transition-colors shadow-lg cursor-pointer"
            >
              Klaim Promo Sekarang
            </a>
          </div>
        </section>
      )}

      {/* ==========================================
          3. CATEGORIES GRID
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Kategori Material Terlaris
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Cari kebutuhan material bangunan Anda berdasarkan kategori spesifik.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat: Category) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 text-center flex flex-col items-center justify-center space-y-3 hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/30 text-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xs font-extrabold text-[var(--text-heading)] truncate w-full">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ==========================================
          4. FEATURED PRODUCTS (Skeletons supported)
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
              Produk Unggulan
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Material pilihan dengan standard mutu terbaik.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center space-x-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {isProductsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] h-80 animate-pulse flex flex-col justify-between p-4"
                >
                  <div className="bg-[var(--border)] h-44 rounded-lg w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="bg-[var(--border)] h-4 w-3/4 rounded" />
                    <div className="bg-[var(--border)] h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))
            : featuredProducts.map((prod: Product) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 group"
                >
                  <div className="bg-[var(--background)] h-48 rounded-lg overflow-hidden relative flex items-center justify-center">
                    {prod.images && prod.images.length > 0 ? (
                      <img
                        src={prod.images[0].imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-[var(--text-disabled)]" />
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--primary)] bg-orange-500/5 px-2 py-0.5 rounded">
                      {prod.categoryName || "Material"}
                    </span>
                    <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors truncate">
                      {prod.name}
                    </h3>
                    <p className="font-heading font-black text-sm text-[var(--text-heading)]">
                      Rp {prod.sellPrice.toLocaleString("id-ID")}
                      <span className="text-[10px] font-normal text-[var(--text-muted)]">
                        /{prod.unit}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* ==========================================
          5. ADVANTAGES & WHY CHOOSE US
          ========================================== */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c02_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--primary)]">
              Keunggulan Kami
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Mengapa TB NS Jaya Menjadi Pilihan Utama Konstruksi Anda?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kami berkomitmen menyuplai bahan bangunan terbaik dengan standard mutu tinggi guna memastikan setiap konstruksi bangunan Anda berdiri kokoh sepanjang masa.
            </p>

            <div className="space-y-4 pt-2">
              {[
                "Kualitas bahan baku berstandar SNI",
                "Harga kompetitif langsung dari distributor utama",
                "Pengiriman cepat dan aman dengan armada mandiri"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                  <span className="text-slate-300 font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-[var(--radius-lg)] space-y-3">
              <Shield className="w-8 h-8 text-[var(--primary)]" />
              <h3 className="font-heading text-sm font-bold">100% Bergaransi</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">Semua produk dijamin asli dan memiliki garansi kualitas material terbaik.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-[var(--radius-lg)] space-y-3">
              <Truck className="w-8 h-8 text-[var(--primary)]" />
              <h3 className="font-heading text-sm font-bold">Armada Pengiriman</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">Layanan pengiriman terjadwal dan siap antar sampai ke lokasi proyek.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-[var(--radius-lg)] space-y-3">
              <RotateCcw className="w-8 h-8 text-[var(--primary)]" />
              <h3 className="font-heading text-sm font-bold">Kemudahan Retur</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">Kebijakan penukaran barang jika terjadi kerusakan saat proses bongkar muat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. NEWEST PRODUCTS
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Produk Terbaru
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Persediaan terbaru yang baru saja masuk ke gudang logistik kami.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {isProductsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] h-80 animate-pulse flex flex-col justify-between p-4"
                >
                  <div className="bg-[var(--border)] h-44 rounded-lg w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="bg-[var(--border)] h-4 w-3/4 rounded" />
                    <div className="bg-[var(--border)] h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))
            : newestProducts.map((prod: Product) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 group"
                >
                  <div className="bg-[var(--background)] h-48 rounded-lg overflow-hidden relative flex items-center justify-center">
                    {prod.images && prod.images.length > 0 ? (
                      <img
                        src={prod.images[0].imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-[var(--text-disabled)]" />
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--primary)] bg-orange-500/5 px-2 py-0.5 rounded">
                      {prod.categoryName || "Material"}
                    </span>
                    <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors truncate">
                      {prod.name}
                    </h3>
                    <p className="font-heading font-black text-sm text-[var(--text-heading)]">
                      Rp {prod.sellPrice.toLocaleString("id-ID")}
                      <span className="text-[10px] font-normal text-[var(--text-muted)]">
                        /{prod.unit}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* ==========================================
          7. TESTIMONIALS
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Apa Kata Mereka?
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Testimoni jujur dari para kontraktor, mandor proyek, dan pemilik rumah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Budi Santoso",
              role: "Kontraktor Sipil",
              text: "Layanan kiriman semen dan besi beton sangat tepat waktu. Sangat membantu menjaga deadline proyek saya di daerah Pasirian."
            },
            {
              name: "Indra Wijaya",
              role: "Developer Perumahan",
              text: "TB NS Jaya memberikan harga grosir yang sangat bersaing. Kualitas keramik dan cat yang dipasok selalu stabil."
            },
            {
              name: "Siti Rahma",
              role: "Pemilik Rumah Mandiri",
              text: "Pelayanan sales via WhatsApp sangat ramah dan sabar membantu menghitung kebutuhan material renovasi rumah saya."
            }
          ].map((testi, idx) => (
            <div key={idx} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-[var(--text-body)] italic leading-relaxed">
                &ldquo;{testi.text}&rdquo;
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {testi.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-heading)]">{testi.name}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          8. PARTNER / LOGOS
          ========================================== */}
      <section className="bg-[var(--border-muted)] py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-6">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Didukung Oleh Brand Konstruksi Ternama
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {partners.map((partner, idx) => (
              <span key={idx} className="font-heading font-extrabold text-sm text-[var(--text-heading)] select-none">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          9. LATEST BLOG
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
              Artikel &amp; Tips Bangunan Terbaru
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Panduan seputar teknik konstruksi dan perawatan bangunan.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center space-x-1"
          >
            <span>Semua Artikel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isBlogsLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] h-80 animate-pulse flex flex-col justify-between p-4"
                >
                  <div className="bg-[var(--border)] h-44 rounded-lg w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="bg-[var(--border)] h-4 w-3/4 rounded" />
                    <div className="bg-[var(--border)] h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))
            : blogs.map((post: Blog) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col hover:shadow-lg group transition-all"
                >
                  <div className="h-48 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-[var(--text-disabled)]" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-[10px] text-[var(--text-muted)] space-x-3">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(post.createdAt).toLocaleDateString("id-ID")}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5" />
                          <span>{post.authorName || "Admin"}</span>
                        </span>
                      </div>
                      <h3 className="font-heading text-sm font-extrabold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* ==========================================
          10. FAQ SECTION
          ========================================== */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Pertanyaan Yang Sering Diajukan
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Temukan jawaban cepat seputar transaksi, pemesanan, dan pengiriman barang.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 flex justify-between items-center font-heading font-extrabold text-sm text-[var(--text-heading)] hover:bg-[var(--border-muted)] transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-[var(--border)] bg-[var(--background)] text-xs leading-relaxed text-[var(--text-body)]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          11. GOOGLE MAPS SECTION
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Lokasi Gerai TB NS Jaya
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Kunjungi gerai fisik kami untuk melihat sampel material konstruksi terlengkap.
          </p>
        </div>

        <div className="w-full h-[400px] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-md relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3947.202396113886!2d113.1118671!3d-8.2326792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd65de74be59c25%3A0xe5a3bb6fa1b1e9c!2sPasirian%2C%20Lumajang%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* ==========================================
          12. CTA SECTION
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-[var(--color-slate-900)] text-white rounded-[var(--radius-xl)] p-8 md:p-16 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c05_1px,transparent_1px),linear-gradient(to_bottom,#ea580c05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-heading text-3xl md:text-5xl font-black leading-tight tracking-tight">
              Siap Memulai Proyek Impian Anda?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Konsultasikan semua jenis kebutuhan material bangunan Anda dengan tim estimasi kami. Dapatkan penawaran harga terbaik sekarang!
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold px-8 py-4 rounded-[var(--radius-md)] shadow-lg shadow-orange-500/10 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Hubungi via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-[var(--radius-md)] transition-colors flex items-center justify-center cursor-pointer"
              >
                Formulir Kontak
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
