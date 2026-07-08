"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  
  const code = searchParams.get("code") || "403";
  const is401 = code === "401";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12 relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444405_1px,transparent_1px),linear-gradient(to_bottom,#ef444405_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-10 w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xl p-8 text-center">
        {/* Error Shield Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/10 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="font-heading text-5xl font-black text-[var(--text-heading)] mb-2 tracking-tight">
          {code}
        </h1>
        <h2 className="font-heading text-lg font-bold text-[var(--text-heading)] mb-3">
          {is401 ? "Sesi Berakhir / Tidak Sah" : "Akses Ditolak"}
        </h2>
        <p className="font-body text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
          {is401
            ? "Sesi Anda telah kedaluwarsa atau token tidak valid. Silakan masuk kembali ke aplikasi."
            : "Anda tidak memiliki hak akses yang cukup untuk membuka halaman ini. Silakan hubungi Owner atau Administrator."}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 px-4 rounded-[var(--radius-md)] transition-all flex items-center justify-center space-x-2 text-sm shadow-md cursor-pointer active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] dark:hover:bg-[var(--color-slate-700)] text-[var(--text-heading)] font-semibold py-3 px-4 rounded-[var(--radius-md)] transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[var(--primary)]"></div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
