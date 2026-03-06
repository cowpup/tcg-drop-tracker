"use client";

import Link from "next/link";
import { DropFeed } from "@/components/drops";
import { Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero - Massive, uneven, attention-grabbing */}
      <section className="relative min-h-[70vh] flex flex-col justify-center -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Angled background slice */}
        <div
          className="absolute inset-0 -skew-y-3 origin-top-left"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(123,44,191,0.12) 100%)",
            top: "-10%",
            height: "120%",
          }}
        />

        {/* Floating orb - positioned randomly */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-30"
          style={{
            background: "radial-gradient(circle, var(--drip-purple) 0%, transparent 70%)",
            top: "10%",
            right: "-15%",
          }}
        />

        <div className="relative z-10 max-w-4xl">
          {/* Tiny label - casual, not corporate */}
          <p className="text-[var(--drip-cyan)] text-sm font-mono mb-4 tracking-wide">
            // for collectors who hate missing drops
          </p>

          {/* Headline - HUGE and broken across lines intentionally */}
          <h1 className="text-[clamp(3rem,10vw,7rem)] font-black leading-[0.9] tracking-tight">
            <span className="block text-[var(--foreground)]">Track with</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, var(--drip-cyan) 0%, var(--drip-purple) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              drip.
            </span>
            <span className="block text-[var(--foreground)] mt-2">Catch the</span>
            <span
              className="block relative"
              style={{
                background: "linear-gradient(135deg, var(--drip-pink) 0%, var(--drip-cyan) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              drop.
              {/* Hand-drawn circle around "drop" */}
              <svg
                className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)]"
                viewBox="0 0 200 100"
                fill="none"
                style={{ transform: "rotate(-2deg)" }}
              >
                <ellipse
                  cx="100"
                  cy="50"
                  rx="95"
                  ry="45"
                  stroke="var(--drip-cyan)"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  opacity="0.5"
                />
              </svg>
            </span>
          </h1>

          {/* Subtext - conversational, not marketing speak */}
          <p className="mt-8 text-xl sm:text-2xl text-[var(--foreground-muted)] max-w-xl leading-relaxed">
            We watch Pokémon Center, Target, Walmart, and everywhere else 24/7.
            <span className="text-[var(--foreground)]"> You just show up when it matters.</span>
          </p>

          {/* CTA - one clear action, not a wall of buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 text-lg font-semibold"
            >
              <span
                className="flex items-center justify-center w-14 h-14 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: "linear-gradient(135deg, var(--drip-cyan) 0%, var(--drip-blue) 100%)",
                  boxShadow: "0 0 40px rgba(0,212,255,0.4)",
                }}
              >
                <Zap className="w-6 h-6 text-white" />
              </span>
              <span className="text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
                Start tracking
                <ArrowRight className="inline ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <span className="text-[var(--foreground-muted)]">or</span>

            <Link
              href="/shows"
              className="text-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] underline underline-offset-4 decoration-dotted decoration-[var(--foreground-muted)]/30 hover:decoration-[var(--drip-cyan)] transition-all"
            >
              find a card show near you
            </Link>
          </div>
        </div>

        {/* Random floating badges - adds visual interest */}
        <div className="absolute bottom-[20%] right-[10%] hidden lg:block">
          <div
            className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm animate-[float_6s_ease-in-out_infinite]"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981",
              transform: "rotate(6deg)",
            }}
          >
            Queue detected at PC →
          </div>
        </div>

        <div className="absolute top-[30%] right-[5%] hidden xl:block">
          <div
            className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm animate-[float_8s_ease-in-out_infinite_0.5s]"
            style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#f59e0b",
              transform: "rotate(-4deg)",
            }}
          >
            Prismatic restock live!
          </div>
        </div>
      </section>

      {/* Quick links - not cards, just text with personality */}
      <section className="py-20 border-t border-white/5">
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-4">
          {[
            { href: "/calendar", label: "Calendar", desc: "See every drop at a glance" },
            { href: "/shows", label: "Trade Shows", desc: "Find events near you" },
            { href: "/retailers", label: "Retailer Radar", desc: "Live queue detection" },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block"
              style={{ transform: `rotate(${(i - 1) * 0.5}deg)` }}
            >
              <span className="text-6xl sm:text-7xl font-black text-white/[0.03] group-hover:text-[var(--drip-cyan)]/10 transition-colors block leading-none">
                0{i + 1}
              </span>
              <span className="block -mt-8 sm:-mt-10 ml-2">
                <span className="text-xl font-semibold text-[var(--foreground)] group-hover:text-[var(--drip-cyan)] transition-colors">
                  {item.label}
                </span>
                <span className="block text-sm text-[var(--foreground-muted)] mt-1">
                  {item.desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Drops section - less formal header */}
      <section className="py-12">
        <div className="flex items-end gap-4 mb-8">
          <h2 className="text-4xl sm:text-5xl font-black text-[var(--foreground)]">
            Drops
          </h2>
          <span className="text-[var(--foreground-muted)] text-sm mb-2 font-mono">
            // what we&apos;re watching
          </span>
        </div>

        <DropFeed />
      </section>

      {/* Bottom CTA - raw, not boxed */}
      <section className="py-20 border-t border-white/5 text-center">
        <p className="text-[var(--foreground-muted)] text-lg mb-4">
          Run a Discord server?
        </p>
        <Link
          href="/webhooks"
          className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)] hover:text-[var(--drip-cyan)] transition-colors"
        >
          Set up alerts for your community
          <ArrowRight className="w-6 h-6" />
        </Link>
      </section>
    </div>
  );
}
