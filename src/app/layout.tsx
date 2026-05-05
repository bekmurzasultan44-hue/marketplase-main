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
  title: "PlayToys — Best Selection of Kids Toys",
  description: "Find the perfect toys for kids of all ages. Quality, safe, and fun! Shop LEGO, plushies, games, and more on PlayToys marketplace.",
  keywords: ["toys", "kids", "LEGO", "games", "plushies", "dolls", "educational", "family"],
  authors: [{ name: "PlayToys" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "PlayToys — Best Selection of Kids Toys",
    description: "Find the perfect toys for kids. Quality, safe, and fun toys for all ages!",
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
