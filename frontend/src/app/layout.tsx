import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smartflow AI ? Smarter Traffic Decisions",
  description: "AI-powered traffic forecasting and real-time city mobility intelligence.",
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
