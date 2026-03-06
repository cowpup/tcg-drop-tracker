"use client";

import Link from "next/link";
import { DropFeed } from "@/components/drops";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero - Clean but bold */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
            <span className="text-[var(--foreground)]">Track with </span>
            <span className="text-gradient">drip.</span>
            <br />
            <span className="text-[var(--foreground)]">Catch the </span>
            <span className="text-gradient">drop.</span>
          </h1>

          <p className="mt-6 text-xl text-[var(--foreground-muted)] max-w-xl">
            Real-time alerts for Pokémon, Magic, Yu-Gi-Oh!, and every TCG drop that matters.
            We watch the queues so you don't have to.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--drip-cyan) 0%, var(--drip-blue) 100%)",
                boxShadow: "0 0 30px rgba(0,212,255,0.3)",
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shows"
              className="text-[var(--foreground-muted)] hover:text-[var(--drip-cyan)] transition-colors"
            >
              Find trade shows →
            </Link>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-12 border-t border-white/5">
        <div className="grid sm:grid-cols-3 gap-8">
          <Link href="/calendar" className="group">
            <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
              Calendar
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Every drop at a glance
            </p>
          </Link>

          <Link href="/shows" className="group">
            <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
              Trade Shows
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Events happening near you
            </p>
          </Link>

          <Link href="/retailers" className="group">
            <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
              Retailer Radar
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Live queue detection
            </p>
          </Link>
        </div>
      </section>

      {/* Drops */}
      <section className="py-12">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Upcoming Drops
          </h2>
          <Link
            href="/calendar"
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--drip-cyan)] transition-colors"
          >
            View all →
          </Link>
        </div>

        <DropFeed />
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t border-white/5 text-center">
        <p className="text-[var(--foreground-muted)] mb-3">
          Run a Discord server?
        </p>
        <Link
          href="/webhooks"
          className="text-2xl font-bold text-[var(--foreground)] hover:text-[var(--drip-cyan)] transition-colors"
        >
          Set up alerts for your community →
        </Link>
      </section>
    </div>
  );
}
