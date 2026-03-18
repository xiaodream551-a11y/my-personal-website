import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "肖峻铭 — 学术主页",
  description: "肖峻铭的学术主页，南京工业大学智能建造专业本科生，热爱人工智能。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${dmSans.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
