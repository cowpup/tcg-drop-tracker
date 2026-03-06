import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drip Drop Tracker",
  description:
    "Track upcoming TCG product drops, restocks, and trade shows for Pokémon, Magic: The Gathering, Yu-Gi-Oh!, and more.",
  keywords: [
    "TCG",
    "Pokemon",
    "Magic the Gathering",
    "Yu-Gi-Oh",
    "Lorcana",
    "card drops",
    "restock tracker",
    "trade shows",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
          style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-white/5 py-8">
            <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[var(--foreground-muted)]">
              <p className="flex items-center justify-center gap-2">
                <span className="text-gradient font-semibold">Drip Drop Tracker</span>
                <span>—</span>
                <span>Free community tool for tracking card game releases and events.</span>
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
