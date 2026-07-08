"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { SettingsService } from "@/services/settings";
import {
  Construction,
  Phone,
  Clock,
  MapPin,
  Menu,
  X,
  MessageSquare,
  Mail,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch website settings dynamically
  const { data: settingsRes } = useSWR("websiteSettings", () =>
    SettingsService.getWebsite()
  );
  const settings = settingsRes?.data;

  const phoneNum = "6282330449041";
  const defaultMsg = "Halo TB NS Jaya, saya tertarik dengan produk material Anda. Bisa dibantu?";
  const waLink = `https://wa.me/${phoneNum}?text=${encodeURIComponent(defaultMsg)}`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Dynamic GA4 & GTM script injection
    const gaId = "G-P1M8K23";
    const gtmId = "GTM-P1M8K23";

    // GA4 script loader
    const gaScript = document.createElement("script");
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    gaScript.async = true;
    document.head.appendChild(gaScript);

    const gaInit = document.createElement("script");
    gaInit.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(gaInit);

    // GTM script loader
    const gtmScript = document.createElement("script");
    gtmScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(gtmScript);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Hubungi Kami", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-body)] font-body">
      {/* ==========================================
          TOP UTILITY BAR
          ========================================== */}
      <div className="hidden sm:block bg-[var(--color-slate-900)] text-slate-400 py-2 border-b border-slate-800 text-xs z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{settings?.waNumber || "+62 823-3044-9041"}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{settings?.operationalHours || "Senin - Sabtu: 08.00 - 17.00"}</span>
            </span>
          </div>
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="truncate max-w-sm">{settings?.address || "Jl. Raya TB NS Jaya, Jawa Timur"}</span>
          </span>
        </div>
      </div>

      {/* ==========================================
          MAIN NAVIGATION HEADER
          ========================================== */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-md py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <Construction className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-[var(--text-heading)] tracking-wider block leading-tight">
                TB NS JAYA
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                Toko Bangunan Modern
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-200 hover:text-[var(--primary)] relative ${
                    isActive ? "text-[var(--primary)]" : "text-[var(--text-heading)]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[var(--primary)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--color-slate-900)] text-white hover:bg-[var(--primary)] px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Konsultasi Gratis</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--text-heading)] hover:bg-[var(--color-slate-100)]"
          >
            {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-[56px] sm:top-[96px] left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] shadow-xl z-30 p-6 flex flex-col space-y-4"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-bold py-2 ${
                    isActive ? "text-[var(--primary)]" : "text-[var(--text-heading)]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] py-3 px-4 rounded-[var(--radius-md)] text-sm font-bold text-center flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/10"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Hubungi via WhatsApp</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          PAGE WRAPPER WITH MOTION TRANSITIONS
          ========================================== */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ==========================================
          FOOTER
          ========================================== */}
      <footer className="bg-[var(--color-slate-950)] text-slate-400 pt-16 pb-8 border-t border-slate-900 mt-20 relative overflow-hidden">
        {/* Subtle glow grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c03_1px,transparent_1px),linear-gradient(to_bottom,#ea580c03_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center">
                <Construction className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-lg text-white tracking-wider block">
                TB NS JAYA
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
              Mitra terpercaya penyedia kebutuhan konstruksi, material bangunan berkualitas tinggi, besi, cat, semen, dan perkakas teknik modern.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operational Hours */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Jam Operasional
            </h4>
            <div className="space-y-2 text-xs text-slate-500">
              <p className="flex justify-between">
                <span>Senin - Sabtu:</span>
                <span className="text-slate-300">08.00 - 17.00 WIB</span>
              </p>
              <p className="flex justify-between border-t border-slate-900 pt-2">
                <span>Minggu &amp; Libur:</span>
                <span className="text-red-500 font-semibold">Tutup</span>
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <span className="text-slate-500 leading-normal">{settings?.address || "Jl. Raya Pasirian, Lumajang, Jawa Timur"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                <span className="text-slate-300">{settings?.waNumber || "+62 823-3044-9041"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                <span className="text-slate-500 hover:text-white transition-colors">{settings?.email || "info@tbnsjaya.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer copyright */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} TB NS Jaya. Semua Hak Cipta Dilindungi. Built with ❤️ for construction excellence.
          </p>
          <div className="flex space-x-4 text-slate-600">
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* ==========================================
          FLOATING WHATSAPP BUTTON (with Pulse Animation)
          ========================================== */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi via WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
      >
        {/* Pulsing ring outline */}
        <span className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping group-hover:animate-none"></span>
        <MessageSquare className="w-6.5 h-6.5 relative z-10" />
      </a>
    </div>
  );
}
