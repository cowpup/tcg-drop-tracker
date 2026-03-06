"use client";

import Image from "next/image";
import { SignalBadge } from "./SignalBadge";
import { GameLabels, RetailerLabels } from "@/types";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import type { Drop, Product } from "@/types";
import { SignalType } from "@/types";

interface DropCardProps {
  drop: Drop & {
    product: Product;
    signals?: Array<{ id: string; type: SignalType; detectedAt: Date }>;
  };
}

const gameAccents: Record<string, string> = {
  POKEMON: "#00d4ff",
  MTG: "#7b2cbf",
  YUGIOH: "#f59e0b",
  LORCANA: "#10b981",
  ONEPIECE: "#ef4444",
  SPORTS: "#6b7280",
  OTHER: "#6b7280",
};

export function DropCard({ drop }: DropCardProps) {
  const gameName = GameLabels[drop.product.game] || drop.product.game;
  const retailerName = RetailerLabels[drop.retailer] || drop.retailer;
  const accent = gameAccents[drop.product.game] || gameAccents.OTHER;

  const urgentSignals = drop.signals?.filter(
    (s) => s.type === "QUEUE_DETECTED" || s.type === "SECURITY_ESCALATED"
  );

  const isLive = drop.status === "LIVE";

  return (
    <article className="group relative">
      {/* Accent bar on left */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full transition-all group-hover:h-full group-hover:top-0 group-hover:bottom-0"
        style={{ background: accent }}
      />

      <div className="pl-6">
        {/* Top row: game + signals */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: accent }}
          >
            {gameName}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          )}
          {urgentSignals?.map((signal) => (
            <SignalBadge key={signal.id} type={signal.type} />
          ))}
        </div>

        {/* Product image - breaking out of container */}
        <div className="relative -ml-6 mb-4">
          <div
            className="relative aspect-[16/10] rounded-xl overflow-hidden bg-white/[0.02] transition-transform group-hover:scale-[1.02] group-hover:-rotate-1"
          >
            {drop.product.imageUrl ? (
              <Image
                src={drop.product.imageUrl}
                alt={drop.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-8xl font-black opacity-10"
                  style={{ color: accent }}
                >
                  {gameName.charAt(0)}
                </span>
              </div>
            )}

            {/* Price tag - floating */}
            {drop.price && (
              <div
                className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-lg font-bold backdrop-blur-md"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                }}
              >
                ${drop.price.toFixed(0)}
              </div>
            )}
          </div>
        </div>

        {/* Product name - big and bold */}
        <h3 className="text-xl font-bold text-[var(--foreground)] leading-tight mb-2 group-hover:text-[var(--drip-cyan)] transition-colors">
          {drop.product.name}
        </h3>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--foreground-muted)]">
            {retailerName}
            {drop.scheduledAt && (
              <> · {format(new Date(drop.scheduledAt), "MMM d")}</>
            )}
          </span>

          {drop.url && (
            <a
              href={drop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-[var(--drip-cyan)] hover:underline"
            >
              Shop
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
