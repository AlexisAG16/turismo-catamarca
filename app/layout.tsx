import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://turismo-catamarca.vercel.app"),
  title: {
    default: "Turismo Catamarca",
    template: "%s | Turismo Catamarca",
  },
  description:
    "Explorá atractivos, circuitos, actividades e itinerarios turísticos de Catamarca.",
  keywords: [
    "Catamarca",
    "turismo",
    "atractivos turísticos",
    "circuitos turísticos",
    "itinerario",
    "Argentina",
  ],
  openGraph: {
    title: "Turismo Catamarca",
    description:
      "Atractivos, circuitos, actividades e itinerarios para recorrer Catamarca.",
    type: "website",
    locale: "es_AR",
    siteName: "Turismo Catamarca",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
