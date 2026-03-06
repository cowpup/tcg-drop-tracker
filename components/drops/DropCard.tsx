"use client";

import Image from "next/image";
import { SignalBadge } from "./SignalBadge";
import { GameLabels, RetailerLabels } from "@/types";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Drop, Product } from "@/types";
import { SignalType } from "@/types";

interface DropCardProps {
  drop: Drop & {
    product: Product;
    signals?: Array<{ id: string; type: SignalType; detectedAt: Date }>;
  };
}

export function DropCard({ drop }: DropCardProps) {
  const gameName = GameLabels[drop.product.game] || drop.product.game;
  const retailerName = RetailerLabels[drop.retailer] || drop.retailer;

  const urgentSignals = drop.signals?.filter(
    (s) => s.type === "QUEUE_DETECTED" || s.type === "SECURITY_ESCALATED"
  );

  const isLive = drop.status === "LIVE";

  return (
    <article className="group bg-[var(--background-elevated)] rounded-xl border border-white/[0.06] overflow-hidden hover:border-[var(--drip-cyan)]/30 transition-colors">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-white/[0.02]">
        {drop.product.imageUrl ? (
          <Image
            src={drop.product.imageUrl}
            alt={drop.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/10">
            {gameName.charAt(0)}
          </div>
        )}

        {/* Status badges - top left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
          {urgentSignals?.map((signal) => (
            <SignalBadge key={signal.id} type={signal.type} />
          ))}
        </div>

        {/* Date badge - top right */}
        {drop.scheduledAt && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            {format(new Date(drop.scheduledAt), "MMM d")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Game + Retailer */}
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--drip-cyan)]">
          <span>{gameName}</span>
          <span className="text-white/20">·</span>
          <span className="text-[var(--foreground-muted)]">{retailerName}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[var(--foreground)] leading-snug line-clamp-2">
          {drop.product.name}
        </h3>

        {/* Price + Link */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-[var(--foreground)]">
            {drop.price ? `$${drop.price.toFixed(0)}` : "TBA"}
          </span>
          {drop.url && (
            <a
              href={drop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--drip-cyan)] hover:underline"
            >
              Shop
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
