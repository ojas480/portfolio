import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import GridBackground from "@/components/GridBackground";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ojas Kalra",
  description:
    "QT Intern at IMC Trading. Math and CS at Georgia Tech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        <GridBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
