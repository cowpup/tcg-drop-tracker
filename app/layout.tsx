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
  title: "TCG Drop Tracker",
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
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 antialiased dark:bg-gray-900`}
        >
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                TCG Drop Tracker — Free community tool for tracking card game
                releases and events.
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
