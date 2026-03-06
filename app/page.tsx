"use client";

import Link from "next/link";
import { DropFeed } from "@/components/drops";
import { Calendar, MapPin, Bell, Sparkles, Zap } from "lucide-react";

// Animated blob background
function FloatingBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large cyan blob - top right */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-[float_8s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--drip-cyan) 0%, transparent 70%)" }}
      />
      {/* Purple blob - bottom left */}
      <div
        className="absolute -bottom-48 -left-24 w-80 h-80 rounded-full opacity-15 blur-3xl animate-[float_10s_ease-in-out_infinite_reverse]"
        style={{ background: "radial-gradient(circle, var(--drip-purple) 0%, transparent 70%)" }}
      />
      {/* Small accent blob */}
      <div
        className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-10 blur-2xl animate-[float_6s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--drip-pink) 0%, transparent 70%)" }}
      />
    </div>
  );
}

// Tilted feature card
function FeatureCard({
  href,
  icon: Icon,
  title,
  description,
  rotation,
  delay,
}: {
  href: string;
  icon: typeof Calendar;
  title: string;
  description: string;
  rotation: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block"
      style={{ transform: rotation, animationDelay: delay }}
    >
      <div
        className="
          relative overflow-hidden rounded-2xl p-6
          bg-white/[0.03] border border-white/[0.06]
          backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:bg-white/[0.06] hover:border-[var(--drip-cyan)]/30
          hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]
          hover:-translate-y-1 hover:rotate-0
          group-hover:scale-[1.02]
        "
      >
        {/* Icon with glow */}
        <div className="relative mb-4 inline-block">
          <Icon className="h-8 w-8 text-[var(--drip-cyan)] transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity bg-[var(--drip-cyan)]" />
        </div>

        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--drip-cyan)] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--foreground-muted)]">
          {description}
        </p>

        {/* Corner accent */}
        <div
          className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl"
          style={{ background: "var(--drip-cyan)" }}
        />
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="relative space-y-16">
      <FloatingBlobs />

      {/* Hero Section - Asymmetric and bold */}
      <section className="relative pt-8 pb-12">
        {/* Main headline - off-center, bold */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--drip-cyan)]/10 border border-[var(--drip-cyan)]/20 mb-6">
            <Sparkles className="h-4 w-4 text-[var(--drip-cyan)]" />
            <span className="text-sm font-medium text-[var(--drip-cyan)]">Never miss a drop again</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-[var(--foreground)]">Track the </span>
            <span className="text-gradient">drip.</span>
            <br />
            <span className="text-[var(--foreground)]">Catch the </span>
            <span className="relative inline-block">
              <span className="text-gradient">drop.</span>
              {/* Underline accent */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8C30 4 70 2 100 6C130 10 170 8 198 4"
                  stroke="url(#underlineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--drip-cyan)" />
                    <stop offset="100%" stopColor="var(--drip-purple)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="text-xl text-[var(--foreground-muted)] max-w-xl mb-8 leading-relaxed">
            Real-time alerts for Pokémon, Magic, Yu-Gi-Oh!, and every TCG that matters.
            We watch the queues so you don&apos;t have to.
          </p>

          {/* CTA Buttons - playful arrangement */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="
                group relative inline-flex items-center gap-2 px-6 py-3
                bg-gradient-to-r from-[var(--drip-cyan)] via-[var(--drip-teal)] to-[var(--drip-blue)]
                rounded-xl font-semibold text-white
                shadow-[0_0_30px_rgba(0,212,255,0.3)]
                hover:shadow-[0_0_50px_rgba(0,212,255,0.5)]
                hover:scale-105 active:scale-100
                transition-all duration-200
              "
            >
              <Zap className="h-5 w-5" />
              Get Started
              <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/shows"
              className="
                inline-flex items-center gap-2 px-6 py-3
                rounded-xl font-medium
                text-[var(--foreground-muted)]
                border border-white/10
                hover:text-[var(--foreground)] hover:bg-white/5 hover:border-white/20
                transition-all duration-200
              "
            >
              <MapPin className="h-5 w-5" />
              Find Events Near You
            </Link>
          </div>
        </div>

        {/* Floating stats - positioned asymmetrically */}
        <div className="absolute top-16 right-0 hidden lg:block">
          <div
            className="
              px-5 py-3 rounded-2xl rotate-3
              bg-white/[0.03] border border-white/[0.08]
              backdrop-blur-sm
            "
          >
            <div className="text-3xl font-bold text-gradient">75+</div>
            <div className="text-sm text-[var(--foreground-muted)]">Products tracked</div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Tilted grid */}
      <section className="relative">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            href="/calendar"
            icon={Calendar}
            title="Drop Calendar"
            description="See every release at a glance. Filter by game, retailer, or date."
            rotation="rotate-[-1deg]"
            delay="0ms"
          />
          <FeatureCard
            href="/shows"
            icon={MapPin}
            title="Trade Shows"
            description="Find card shows, conventions, and meetups happening near you."
            rotation="rotate-[0.5deg]"
            delay="50ms"
          />
          <FeatureCard
            href="/webhooks"
            icon={Bell}
            title="Server Alerts"
            description="Instant Discord notifications when products go live or queues activate."
            rotation="rotate-[-0.5deg]"
            delay="100ms"
          />
        </div>
      </section>

      {/* Drops Section */}
      <section className="relative">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">
              Upcoming Drops
            </h2>
            <p className="text-[var(--foreground-muted)]">
              The latest releases we&apos;re tracking
            </p>
          </div>
          <Link
            href="/calendar"
            className="text-sm font-medium text-[var(--drip-cyan)] hover:underline underline-offset-4"
          >
            View all →
          </Link>
        </div>

        <DropFeed />
      </section>
    </div>
  );
}
