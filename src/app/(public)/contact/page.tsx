"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { SettingsService } from "@/services/settings";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";

export default function ContactPage() {
  // Fetch settings dynamically
  const { data: settingsRes } = useSWR("websiteSettings", () =>
    SettingsService.getWebsite()
  );
  const settings = settingsRes?.data;

  // Form State
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    
    const phoneNum = "6282330449041";
    const fullMsg = `Halo TB NS Jaya, saya *${name}*.\n\nPesan:\n${message}`;
    const waLink = `https://wa.me/${phoneNum}?text=${encodeURIComponent(fullMsg)}`;
    window.open(waLink, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="font-heading text-4xl font-black text-[var(--text-heading)] tracking-tight">
          Hubungi Kami
        </h1>
        <p className="font-body text-sm text-[var(--text-muted)] leading-relaxed">
          Punya pertanyaan seputar ketersediaan material, penawaran harga khusus proyek, atau kendala pengiriman? Tim sales kami siap membantu.
        </p>
      </div>

      {/* Info & Form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 space-y-6">
            <h3 className="font-heading text-lg font-bold text-[var(--text-heading)]">Informasi Gerai</h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3.5 text-xs">
                <MapPin className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[var(--text-heading)]">Alamat</h4>
                  <p className="text-[var(--text-muted)] leading-relaxed mt-0.5">
                    {settings?.address || "Jl. Raya Pasirian, Lumajang, Jawa Timur"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-xs">
                <Phone className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[var(--text-heading)]">WhatsApp Sales</h4>
                  <p className="text-[var(--text-muted)] mt-0.5">
                    {settings?.waNumber || "+62 823-3044-9041"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-xs">
                <Mail className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[var(--text-heading)]">Email</h4>
                  <p className="text-[var(--text-muted)] mt-0.5">
                    {settings?.email || "info@tbnsjaya.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-xs">
                <Clock className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[var(--text-heading)]">Jam Operasional</h4>
                  <p className="text-[var(--text-muted)] mt-0.5">
                    {settings?.operationalHours || "Senin - Sabtu: 08.00 - 17.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (Right) */}
        <div className="lg:col-span-7">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-[var(--text-heading)] mb-6">Kirim Pesan Langsung</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Nama Anda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Pesan / Pertanyaan
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan detail barang material yang ingin Anda tanyakan..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 px-4 rounded-[var(--radius-md)] shadow-lg shadow-orange-500/10 flex items-center justify-center space-x-2 text-xs cursor-pointer transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Kirim via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Google Map */}
      <div className="w-full h-[400px] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm relative">
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
    </div>
  );
}
