import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider, SWRProvider, AuthProvider } from "@/components/providers";
import { Toaster } from "sonner";
import "@/app/global.css";

/* ------------------------------------------------------------
   Font Configuration
   ------------------------------------------------------------ */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["500", "600", "700"],
});

/* ------------------------------------------------------------
   Global Metadata (SEO)
   ------------------------------------------------------------ */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://tbnsjaya.com"
  ),
  title: {
    default: "TB NS Jaya — Toko Bangunan Modern",
    template: "%s | TB NS Jaya",
  },
  description:
    "Toko bangunan modern dengan material berkualitas, harga terbaik, dan layanan terpercaya. Tersedia semen, besi, cat, pipa, dan kebutuhan bangunan lainnya.",
  keywords: [
    "toko bangunan",
    "material bangunan",
    "TB NS Jaya",
    "semen",
    "besi",
    "cat",
    "pipa",
    "konstruksi",
  ],
  authors: [{ name: "TB NS Jaya" }],
  creator: "TB NS Jaya",
  publisher: "TB NS Jaya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "TB NS Jaya",
    title: "TB NS Jaya — Toko Bangunan Modern",
    description:
      "Toko bangunan modern dengan material berkualitas, harga terbaik, dan layanan terpercaya.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TB NS Jaya — Toko Bangunan Modern",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TB NS Jaya — Toko Bangunan Modern",
    description:
      "Toko bangunan modern dengan material berkualitas, harga terbaik, dan layanan terpercaya.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/* ------------------------------------------------------------
   Root Layout
   ------------------------------------------------------------ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* JSON-LD: LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HomeAndConstructionBusiness",
              name: "TB NS Jaya",
              description:
                "Toko bangunan modern dengan material berkualitas dan harga terbaik.",
              url: process.env.NEXT_PUBLIC_APP_URL,
              telephone: process.env.NEXT_PUBLIC_WA_NUMBER,
              address: {
                "@type": "PostalAddress",
                addressCountry: "ID",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                opens: "08:00",
                closes: "17:00",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-body antialiased`}>
        <ThemeProvider>
          <SWRProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SWRProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "var(--font-inter)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
