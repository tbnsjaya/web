import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan",
  description: "Halaman yang Anda cari tidak ditemukan.",
};

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <p
          style={{
            fontSize: "6rem",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            color: "var(--border)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          404
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-heading)",
          }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            lineHeight: "1.6",
          }}
        >
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <Link
            href="/"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
