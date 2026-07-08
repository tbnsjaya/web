"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GuestGuard } from "@/components/providers";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Construction, Eye, EyeOff, ShieldCheck, HelpCircle } from "lucide-react";

// Form Schema using Zod
const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(5, "Password minimal 5 karakter"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success) {
        toast.success("Login berhasil! Selamat datang kembali.");
      } else {
        toast.error(result.message || "Username atau password salah.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Terjadi kesalahan sistem, silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12 relative overflow-hidden">
        {/* Decorative Grid Lines - Industrial Aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c0a_1px,transparent_1px),linear-gradient(to_bottom,#ea580c0a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] opacity-5 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 opacity-5 rounded-full filter blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 mb-4 border border-orange-400/20 animate-pulse">
              <Construction className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-3xl font-extrabold text-[var(--text-heading)] tracking-wider">
              TB NS JAYA
            </h1>
            <p className="font-body text-sm text-[var(--text-muted)] mt-1">
              Toko Bangunan Modern &amp; Distribusi Material
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xl p-8 backdrop-blur-md bg-opacity-95">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-heading)]">
                Masuk Sistem
              </h2>
              <p className="font-body text-xs text-[var(--text-muted)] mt-1">
                Gunakan akun administrator Anda untuk mengakses dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  {...register("username")}
                  className={`w-full px-4 py-3 rounded-[var(--radius-md)] border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 bg-[var(--background)] ${
                    errors.username
                      ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] text-[var(--color-danger-text)]"
                      : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] text-[var(--text-heading)]"
                  }`}
                />
                {errors.username && (
                  <p className="text-[var(--color-danger-text)] text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-4 pr-11 py-3 rounded-[var(--radius-md)] border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 bg-[var(--background)] ${
                      errors.password
                        ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] text-[var(--color-danger-text)]"
                        : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] text-[var(--text-heading)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[var(--color-danger-text)] text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none text-[var(--text-body)]">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-opacity-25"
                  />
                  <span>Ingat Saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[var(--primary)] hover:underline font-semibold focus:outline-none"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 px-4 rounded-[var(--radius-md)] shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Masuk Aplikasi</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} TB NS Jaya. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>

        {/* Sleek Lupa Password Modal Placeholder */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 max-w-sm w-full shadow-2xl relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-[var(--primary)]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[var(--text-heading)]">
                  Lupa Password?
                </h3>
              </div>
              <p className="font-body text-sm text-[var(--text-body)] mb-6 leading-relaxed">
                Untuk alasan keamanan, pemulihan atau pergantian password akun harus dilakukan melalui Administrator utama atau Owner di kantor TB NS Jaya. Silakan hubungi tim IT atau Owner secara langsung.
              </p>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] dark:hover:bg-[var(--color-slate-700)] text-[var(--text-heading)] font-semibold py-2.5 px-4 rounded-[var(--radius-md)] text-sm transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </GuestGuard>
  );
}
