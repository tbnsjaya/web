'use client';

import { useActionState, useEffect } from 'react';
import { loginAction } from '../actions/auth';
import { Lock, User, ShieldAlert, ArrowRight, Building2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden transition-colors duration-500">

      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/60 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50/80 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-6 z-10">

        {/* Back to Landing Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="glass-header rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-200/80 relative overflow-hidden animate-slide-up">

          {/* Top accent stripe — orange for login to distinguish from dashboard */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-400"></div>

          <div className="text-center mb-8 stagger-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200 text-white mb-6">
              <Building2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              TB NS JAYA
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Portal Admin — Sistem Manajemen Keuangan & POS
            </p>
          </div>

          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 stagger-2">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600 font-medium">
                {state.error}
              </p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4 stagger-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder="Username"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-press stagger-4 group relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isPending ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                {!isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center stagger-4">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldAlert size={12} /> Akses ini hanya untuk admin TB NS JAYA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
