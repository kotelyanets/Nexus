import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus | Real-Time Crypto Analytics",
  description: "High-Load Real-Time Crypto Analytics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} premium-gradient min-h-screen text-foreground`}>
        {children}
      </body>
    </html>
  );
}
