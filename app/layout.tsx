import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiteClub · Pick a place together",
  description: "Find restaurants, bring everyone’s preferences together, and settle dinner with a shortlist, quick pick or restaurant battle.",
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
