"use client";

import Link from "next/link";
import { DropFeed } from "@/components/drops";
import { ArrowRight, Zap, Radio, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="pt-12 sm:pt-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--drip-cyan)]/10 border border-[var(--drip-cyan)]/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--drip-cyan)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--drip-cyan)]">Monitoring 75+ products 24/7</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[var(--foreground)]">
            Track with drip.
            <br />
            <span className="text-[var(--drip-cyan)]">Catch the drop.</span>
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-lg text-[var(--foreground-muted)] leading-relaxed">
            Real-time restock alerts for Pokémon, Magic, Yu-Gi-Oh!, and more.
            We detect queues before drops go live.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-[var(--background)] bg-[var(--drip-cyan)] hover:brightness-110 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/retailers"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Radio className="w-4 h-4" />
              View live status
            </Link>
          </div>
        </div>
      </section>

      {/* Features - 3 column */}
      <section className="grid sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--drip-cyan)]/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[var(--drip-cyan)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Queue Detection</h3>
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
            We monitor retailers every 3 minutes. When queues activate, you know before the crowd.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--drip-cyan)]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[var(--drip-cyan)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Drop Calendar</h3>
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
            Every upcoming release in one place. Filter by game, retailer, or date.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--drip-cyan)]/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-[var(--drip-cyan)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Discord Alerts</h3>
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
            Connect your server. Get instant alerts when products drop or queues go live.
          </p>
        </div>
      </section>

      {/* Drops */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Upcoming Drops</h2>
          <Link
            href="/calendar"
            className="text-sm font-medium text-[var(--drip-cyan)] hover:underline"
          >
            View calendar →
          </Link>
        </div>
        <DropFeed />
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-12 border-t border-white/5">
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
          Run a Discord server?
        </h3>
        <p className="text-[var(--foreground-muted)] mb-6">
          Set up automated alerts for your community in minutes.
        </p>
        <Link
          href="/webhooks"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-[var(--background)] bg-[var(--drip-cyan)] hover:brightness-110 transition-all"
        >
          Set up alerts
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
