"use client";

import React from "react";
import { AuthGuard } from "@/components/providers";
import { ShieldAlert, Users, Settings } from "lucide-react";

export default function SettingsUsersPage() {
  return (
    <AuthGuard permission="settings.read">
      <div className="space-y-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
                Pengaturan Pengguna &amp; Hak Akses
              </h1>
              <p className="font-body text-xs text-[var(--text-muted)]">
                Mengelola akun karyawan, kasir, dan penugasan role.
              </p>
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 text-[var(--text-body)] p-4 rounded-lg flex items-start space-x-3">
            <Settings className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-[var(--text-heading)] mb-1">Zona Keamanan Tinggi</h4>
              <p className="leading-relaxed text-[var(--text-muted)]">
                Halaman ini hanya dapat diakses oleh Admin atau Owner. Akun Kasir yang mencoba memuat URL ini secara langsung akan diblokir oleh Route Guard dan diarahkan ke halaman 403 Unauthorized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
