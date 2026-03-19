import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🎰 Roulette Multijoueur - Casino en ligne",
  description: "Jeu de roulette européenne en ligne avec mode solo et multijoueur. Jouez avec vos amis avec de l'argent fictif!",
  keywords: ["roulette", "casino", "jeu", "multijoueur", "en ligne", "roulette européenne"],
  authors: [{ name: "Roulette Game" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "🎰 Roulette Multijoueur",
    description: "Jeu de roulette européenne avec mode solo et multijoueur",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
