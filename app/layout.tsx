import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import GridBackground from "@/components/GridBackground";
import ThemeSwitch from "@/components/ThemeSwitch";
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light' || (!('theme' in localStorage) && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('light')
                } else {
                  document.documentElement.classList.remove('light')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <GridBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <ThemeSwitch />
        <Analytics />
      </body>
    </html>
  );
}
