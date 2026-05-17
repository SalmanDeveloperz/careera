import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Careera — Intelligent Career Guidance",
  description:
    "Real-time career opportunities: GSoC, open source, competitions, internships, and programs students rarely discover.",
  icons: {
    icon: [{ url: "/brand/logo-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/logo-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Careera — Intelligent Career Guidance",
    description:
      "Discover GSoC, open source, competitions, and internships in real time.",
    images: [{ url: "/brand/logo-icon.svg", width: 512, height: 512 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
