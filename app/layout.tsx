import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airacle · 达人合作工作台",
  description: "发现适合你的品牌合作，一站完成报名、交付与结算。交互演示站。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
