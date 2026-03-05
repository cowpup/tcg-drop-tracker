"use client";

import Image from "next/image";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { SignalBadge } from "./SignalBadge";
import { GameLabels, RetailerLabels, DropTypeLabels } from "@/types";
import { ExternalLink, Calendar } from "lucide-react";
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

export function DropCard({ drop }: DropCardProps) {
  const gameName = GameLabels[drop.product.game] || drop.product.game;
  const retailerName = RetailerLabels[drop.retailer] || drop.retailer;
  const dropTypeName = DropTypeLabels[drop.dropType] || drop.dropType;

  const hasActiveSignals = drop.signals && drop.signals.length > 0;
  const urgentSignals = drop.signals?.filter(
    (s) => s.type === "QUEUE_DETECTED" || s.type === "SECURITY_ESCALATED"
  );

  return (
    <Card hover padding="none" className="overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
        {drop.product.imageUrl ? (
          <Image
            src={drop.product.imageUrl}
            alt={drop.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <span className="text-4xl">{gameName.charAt(0)}</span>
          </div>
        )}

        {/* Status overlay */}
        {drop.status === "LIVE" && (
          <div className="absolute right-2 top-2">
            <Badge variant="success" pulse>
              LIVE NOW
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Badges Row */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant={gameColors[drop.product.game]} size="sm">
            {gameName}
          </Badge>
          <Badge variant={statusVariants[drop.status]} size="sm">
            {drop.status.replace("_", " ")}
          </Badge>

          {/* Signal badges */}
          {urgentSignals?.map((signal) => (
            <SignalBadge key={signal.id} type={signal.type} />
          ))}
        </div>

        {/* Product Info */}
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {drop.product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {retailerName} &middot; {dropTypeName}
        </p>

        {/* Price & Date */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {drop.price ? `$${drop.price.toFixed(2)}` : "TBA"}
          </span>
          {drop.scheduledAt && (
            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(drop.scheduledAt), "MMM d, yyyy")}
            </span>
          )}
        </div>

        {/* Link */}
        {drop.url && (
          <a
            href={drop.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            View at {retailerName}
          </a>
        )}
      </div>
    </Card>
  );
}
