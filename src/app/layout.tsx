import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const minecraft = Press_Start_2P({
  variable: "--font-minecraft",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nostalgia Ultra | Minecraft Server",
  description: "A cozy Minecraft server for endless adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${minecraft.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
