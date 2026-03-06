"use client";

import Link from "next/link";
import { DropFeed } from "@/components/drops";
import { ArrowDown, Bell, MapPin, Radio } from "lucide-react";

export default function Home() {
  const scrollToDrops = () => {
    document.getElementById("drops")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero - Compact, purposeful */}
      <section className="py-8 sm:py-12 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left: Headline + CTA */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-[var(--foreground)] mb-4">
            Track with drip.
            <br />
            <span className="text-[var(--drip-cyan)]">Catch the drop.</span>
          </h1>
          <p className="text-lg text-[var(--foreground-muted)] mb-6 max-w-md">
            Real-time restock alerts and queue detection for Pokémon, Magic, Yu-Gi-Oh!, and more.
          </p>
          <button
            onClick={scrollToDrops}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-[var(--background)] bg-[var(--drip-cyan)] hover:brightness-110 transition-all"
          >
            See upcoming drops
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick links grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/calendar"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[var(--drip-cyan)]/30 hover:bg-white/[0.04] transition-all"
          >
            <div className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
              Calendar
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              All releases at a glance
            </p>
          </Link>

          <Link
            href="/retailers"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[var(--drip-cyan)]/30 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--drip-cyan)]" />
              <span className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
                Radar
              </span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Live queue detection
            </p>
          </Link>

          <Link
            href="/shows"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[var(--drip-cyan)]/30 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--drip-cyan)]" />
              <span className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
                Shows
              </span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Trade shows near you
            </p>
          </Link>

          <Link
            href="/webhooks"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[var(--drip-cyan)]/30 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--drip-cyan)]" />
              <span className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
                Alerts
              </span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Discord notifications
            </p>
          </Link>
        </div>
      </section>

      {/* Drops */}
      <section id="drops" className="py-12 scroll-mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Upcoming Drops</h2>
          <Link
            href="/calendar"
            className="text-sm font-medium text-[var(--drip-cyan)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <DropFeed />
      </section>
    </div>
  );
}
