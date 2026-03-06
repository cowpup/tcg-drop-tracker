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
    <article className="group">
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.02] mb-4">
        {drop.product.imageUrl ? (
          <Image
            src={drop.product.imageUrl}
            alt={drop.product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-6xl font-black opacity-20"
              style={{ color: accent }}
            >
              {gameName.charAt(0)}
            </span>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}

        {/* Price */}
        {drop.price && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white font-bold">
            ${drop.price.toFixed(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: accent }}
          >
            {gameName}
          </span>
          {urgentSignals?.map((signal) => (
            <SignalBadge key={signal.id} type={signal.type} />
          ))}
        </div>

        <h3 className="font-semibold text-[var(--foreground)] leading-snug group-hover:text-[var(--drip-cyan)] transition-colors">
          {drop.product.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
          <span>
            {retailerName}
            {drop.scheduledAt && <> · {format(new Date(drop.scheduledAt), "MMM d")}</>}
          </span>

          {drop.url && (
            <a
              href={drop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[var(--drip-cyan)] hover:underline"
            >
              Shop <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
