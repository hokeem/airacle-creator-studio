import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airacle · Creator Studio",
  description: "Discover brand partnerships and manage applications, deliverables and payments in one creator studio.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
