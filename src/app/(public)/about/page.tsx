"use client";

import React from "react";
import { Building2, Shield, Users, Target, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-20 py-12">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-black text-[var(--text-heading)] tracking-tight">
          Tentang TB NS Jaya
        </h1>
        <p className="font-body text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          Dedikasi penuh menjadi mitra terpercaya penyedia material bangunan modern berkualitas tinggi sejak awal berdiri.
        </p>
      </section>

      {/* Corporate Story */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Membangun Kualitas Tanpa Kompromi
          </h2>
          <p className="text-sm text-[var(--text-body)] leading-relaxed">
            TB NS Jaya hadir untuk menjawab kebutuhan bahan bangunan yang terus berkembang. Kami tidak hanya menjual barang, melainkan memberikan solusi konstruksi terbaik melalui konsultasi estimasi material yang presisi dan pelayanan pengantaran logistik yang andal.
          </p>
          <p className="text-sm text-[var(--text-body)] leading-relaxed">
            Dengan dukungan kemitraan bersama produsen semen, besi baja, keramik, dan cat terkemuka berskala nasional, kami menjamin seluruh pasokan material konstruksi Anda memenuhi standard mutu industri (SNI).
          </p>
        </div>
        <div className="bg-[var(--border-muted)] h-[350px] rounded-[var(--radius-xl)] border border-[var(--border)] flex items-center justify-center relative overflow-hidden shadow-inner">
          <Building2 className="w-24 h-24 text-[var(--text-disabled)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/20 to-transparent" />
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[var(--primary)] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[var(--text-heading)]">Visi Kami</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Menjadi jaringan distribusi dan ritel toko bangunan modern terdepan yang berkontribusi nyata dalam memperkokoh setiap infrastruktur dan hunian masyarakat Indonesia.
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[var(--primary)] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[var(--text-heading)]">Misi Kami</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Menyediakan material bangunan berkualitas dengan harga yang jujur dan transparan, membangun sistem pelayanan kasir modern yang efisien, serta senantiasa mengutamakan kepuasan pelanggan melalui pengiriman yang tepat waktu.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)]">
            Nilai Utama Perusahaan
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Fondasi penting yang mendasari setiap keputusan operasional kami sehari-hari.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center space-y-3">
            <Shield className="w-10 h-10 text-[var(--primary)] mx-auto" />
            <h4 className="font-heading text-sm font-bold text-[var(--text-heading)]">Integritas &amp; Kejujuran</h4>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Pemberian informasi spesifikasi barang dan penawaran harga material secara jujur tanpa manipulasi.
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[var(--primary)] mx-auto" />
            <h4 className="font-heading text-sm font-bold text-[var(--text-heading)]">Standardisasi Mutu</h4>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Pemeriksaan kualitas secara ketat sebelum barang dimasukkan ke dalam daftar inventaris gudang.
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center space-y-3">
            <Users className="w-10 h-10 text-[var(--primary)] mx-auto" />
            <h4 className="font-heading text-sm font-bold text-[var(--text-heading)]">Kerjasama Tim</h4>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Kolaborasi erat dari admin penjualan, kasir, staf gudang, hingga pengemudi logistik demi kepuasan Anda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
