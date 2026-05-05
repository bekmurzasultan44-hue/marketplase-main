import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS — The Creative Marketplace",
  description: "Where creators and collectors converge. Discover unique digital goods, creative assets, and handcrafted products from the world's most innovative artists and makers.",
  keywords: ["marketplace", "creative", "digital goods", "art", "design", "NFT", "3D assets"],
  authors: [{ name: "NEXUS Marketplace" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "NEXUS — The Creative Marketplace",
    description: "Where creators and collectors converge. Discover unique digital goods.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
