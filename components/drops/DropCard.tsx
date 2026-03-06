"use client";

import Image from "next/image";
import { Badge } from "@/components/ui";
import { SignalBadge } from "./SignalBadge";
import { GameLabels, RetailerLabels, DropTypeLabels } from "@/types";
import { ExternalLink, Calendar, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import type { Drop, Product } from "@/types";
import { SignalType } from "@/types";

interface DropCardProps {
  drop: Drop & {
    product: Product;
    signals?: Array<{ id: string; type: SignalType; detectedAt: Date }>;
  };
}

const gameColors: Record<string, "primary" | "info" | "warning" | "success" | "danger" | "default"> = {
  POKEMON: "primary",
  MTG: "info",
  YUGIOH: "warning",
  LORCANA: "success",
  ONEPIECE: "danger",
  SPORTS: "default",
  OTHER: "default",
};

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  UPCOMING: "default",
  LIVE: "success",
  QUEUE_ACTIVE: "warning",
  SOLD_OUT: "danger",
  CANCELLED: "danger",
};

// Game-specific accent colors for the card glow
const gameGlowColors: Record<string, string> = {
  POKEMON: "rgba(0, 212, 255, 0.15)",
  MTG: "rgba(123, 44, 191, 0.15)",
  YUGIOH: "rgba(245, 158, 11, 0.15)",
  LORCANA: "rgba(16, 185, 129, 0.15)",
  ONEPIECE: "rgba(239, 68, 68, 0.15)",
  SPORTS: "rgba(107, 114, 128, 0.15)",
  OTHER: "rgba(107, 114, 128, 0.15)",
};

export function DropCard({ drop }: DropCardProps) {
  const gameName = GameLabels[drop.product.game] || drop.product.game;
  const retailerName = RetailerLabels[drop.retailer] || drop.retailer;
  const dropTypeName = DropTypeLabels[drop.dropType] || drop.dropType;
  const glowColor = gameGlowColors[drop.product.game] || gameGlowColors.OTHER;

  const urgentSignals = drop.signals?.filter(
    (s) => s.type === "QUEUE_DETECTED" || s.type === "SECURITY_ESCALATED"
  );

  const isLive = drop.status === "LIVE";
  const isQueueActive = drop.status === "QUEUE_ACTIVE";

  return (
    <div
      className="
        group relative
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:rotate-[0.5deg]
      "
    >
      {/* Glow effect on hover */}
      <div
        className="
          absolute -inset-1 rounded-2xl opacity-0
          group-hover:opacity-100 transition-opacity duration-300 blur-xl
        "
        style={{ background: glowColor }}
      />

      {/* Card */}
      <div
        className="
          relative overflow-hidden rounded-2xl
          bg-[var(--background-elevated)]
          border border-white/[0.06]
          transition-all duration-300
          group-hover:border-white/[0.12]
        "
      >
        {/* Live indicator - pulsing top border */}
        {(isLive || isQueueActive) && (
          <div
            className="absolute top-0 inset-x-0 h-0.5"
            style={{
              background: isLive
                ? "linear-gradient(90deg, transparent, #10b981, transparent)"
                : "linear-gradient(90deg, transparent, #f59e0b, transparent)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Product Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
          {drop.product.imageUrl ? (
            <Image
              src={drop.product.imageUrl}
              alt={drop.product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span
                className="text-6xl font-bold opacity-20"
                style={{ color: "var(--drip-cyan)" }}
              >
                {gameName.charAt(0)}
              </span>
            </div>
          )}

          {/* Status overlay - top right */}
          {isLive && (
            <div className="absolute right-3 top-3">
              <Badge variant="success" pulse glow>
                LIVE NOW
              </Badge>
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
            style={{
              background: "linear-gradient(to top, var(--background-elevated), transparent)",
            }}
          />
        </div>

        <div className="relative p-5">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={gameColors[drop.product.game]} size="sm">
              {gameName}
            </Badge>
            {!isLive && (
              <Badge variant={statusVariants[drop.status]} size="sm">
                {drop.status.replace("_", " ")}
              </Badge>
            )}
            {urgentSignals?.map((signal) => (
              <SignalBadge key={signal.id} type={signal.type} />
            ))}
          </div>

          {/* Product Info */}
          <h3 className="font-semibold text-[var(--foreground)] text-lg leading-tight line-clamp-2 mb-2 group-hover:text-[var(--drip-cyan)] transition-colors">
            {drop.product.name}
          </h3>

          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            {retailerName} · {dropTypeName}
          </p>

          {/* Price & Date Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {drop.price ? `$${drop.price.toFixed(2)}` : (
                <span className="text-[var(--foreground-muted)] text-lg">Price TBA</span>
              )}
            </span>
            {drop.scheduledAt && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] bg-white/5 px-2 py-1 rounded-lg">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(drop.scheduledAt), "MMM d")}
              </span>
            )}
          </div>

          {/* Action Button */}
          {drop.url && (
            <a
              href={drop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-2 w-full
                px-4 py-3 rounded-xl
                bg-gradient-to-r from-[var(--drip-cyan)] via-[var(--drip-teal)] to-[var(--drip-blue)]
                text-white font-semibold text-sm
                shadow-[0_0_20px_rgba(0,212,255,0.2)]
                hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]
                hover:brightness-110
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              Shop at {retailerName}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
