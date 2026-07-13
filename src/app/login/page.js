'use client';

import { useActionState, useEffect } from 'react';
import { loginAction } from '../actions/auth';
import { Lock, User, ShieldAlert, ArrowRight, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md p-8 z-10">
        <div className="glass-header rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden animate-slide-up">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="text-center mb-8 stagger-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg text-white mb-6">
              <Activity size={32} className="animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              TBNS Jaya
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Sistem Manajemen Keuangan & POS
            </p>
          </div>

          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 stagger-2">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {state.error}
              </p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4 stagger-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder="Username"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-press stagger-4 group relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isPending ? 'Memverifikasi...' : 'Masuk Aplikasi'}
                {!isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center stagger-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldAlert size={12} /> Aplikasi diamankan dengan enkripsi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
