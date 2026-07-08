"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error ke monitoring (misal Sentry) di masa mendatang
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div
      role="alert"
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
        <div
          style={{
            width: "64px",
            height: "64px",
            backgroundColor: "var(--color-danger-bg)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
          }}
        >
          ⚠️
        </div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-heading)",
          }}
        >
          Terjadi Kesalahan
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            lineHeight: "1.6",
          }}
        >
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
          Silakan coba lagi.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre
            style={{
              fontSize: "0.75rem",
              backgroundColor: "var(--danger-bg)",
              color: "var(--color-danger)",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "left",
              overflow: "auto",
              width: "100%",
              maxHeight: "120px",
            }}
          >
            {error.message}
          </pre>
        )}
        <button
          onClick={reset}
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            borderRadius: "8px",
            padding: "10px 24px",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
