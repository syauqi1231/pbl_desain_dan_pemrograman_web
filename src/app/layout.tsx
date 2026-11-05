import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteName = "Boutique NC";
const description =
  "Kebaya, batik, dan tenun pilihan. Coba tampilannya dengan AI Virtual Try-On sebelum memesan.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "kebaya modern",
    "batik tulis",
    "tenun ikat",
    "boutique Indonesia",
    "virtual try-on",
    "AI try-on",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName,
    title: siteName,
    description,
    images: [
      {
        url: "/hero-kebaya.jpg",
        alt: "Model memakai kebaya dengan kain batik",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/hero-kebaya.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${body.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
