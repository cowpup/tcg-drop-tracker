"use client";

import { useState } from "react";
import { useDrops } from "@/hooks";
import { DropCard } from "./DropCard";
import { LoadingSpinner } from "@/components/ui";
import { FilterBar, SelectFilter, ClearFiltersButton } from "@/components/ui";
import {
  Game,
  Retailer,
  DropType,
  DropStatus,
  GameLabels,
  RetailerLabels,
  DropTypeLabels,
  DropStatusLabels,
} from "@/types";
import { AlertCircle, RefreshCw, Droplets, Bell } from "lucide-react";
import Link from "next/link";

const gameOptions = Object.values(Game).map((g) => ({
  value: g,
  label: GameLabels[g] || g,
}));

const retailerOptions = Object.values(Retailer).map((r) => ({
  value: r,
  label: RetailerLabels[r] || r,
}));

const dropTypeOptions = Object.values(DropType).map((t) => ({
  value: t,
  label: DropTypeLabels[t] || t,
}));

const statusOptions = Object.values(DropStatus).map((s) => ({
  value: s,
  label: DropStatusLabels[s] || s,
}));

export function DropFeed() {
  const [filters, setFilters] = useState({
    game: "",
    retailer: "",
    dropType: "",
    status: "",
  });

  const { drops, loading, error, refetch } = useDrops({
    ...filters,
    upcoming: true,
  });

  const clearFilters = () => {
    setFilters({
      game: "",
      retailer: "",
      dropType: "",
      status: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center">
        <div className="relative mb-4">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div className="absolute inset-0 blur-xl bg-red-500/30" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] mb-6 max-w-sm">
          We couldn&apos;t load the drops. This is probably temporary.
        </p>
        <button
          onClick={refetch}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            bg-red-500/10 border border-red-500/20 rounded-xl
            text-red-400 font-medium text-sm
            hover:bg-red-500/20 transition-all duration-200
          "
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar>
        <SelectFilter
          label="Game"
          value={filters.game}
          options={gameOptions}
          onChange={(value) => setFilters((f) => ({ ...f, game: value }))}
        />
        <SelectFilter
          label="Retailer"
          value={filters.retailer}
          options={retailerOptions}
          onChange={(value) => setFilters((f) => ({ ...f, retailer: value }))}
        />
        <SelectFilter
          label="Type"
          value={filters.dropType}
          options={dropTypeOptions}
          onChange={(value) => setFilters((f) => ({ ...f, dropType: value }))}
        />
        <SelectFilter
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(value) => setFilters((f) => ({ ...f, status: value }))}
        />
        {hasActiveFilters && <ClearFiltersButton onClick={clearFilters} />}
      </FilterBar>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-[var(--foreground-muted)] animate-pulse">
            Finding the freshest drops...
          </p>
        </div>
      )}

      {/* Empty State - With personality! */}
      {!loading && drops.length === 0 && (
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center overflow-hidden">
          {/* Decorative blobs */}
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--drip-cyan) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--drip-purple) 0%, transparent 70%)" }}
          />

          {/* Animated droplet icon */}
          <div className="relative mb-6">
            <Droplets className="h-16 w-16 text-[var(--drip-cyan)] animate-[float_3s_ease-in-out_infinite]" />
            <div className="absolute inset-0 blur-2xl bg-[var(--drip-cyan)]/20" />
          </div>

          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {hasActiveFilters ? "No matches found" : "No drops yet"}
          </h3>
          <p className="text-[var(--foreground-muted)] max-w-md mb-8">
            {hasActiveFilters
              ? "Try adjusting your filters or check back later for new drops."
              : "We're watching the retailers. When something drops, you'll see it here."}
          </p>

          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                bg-white/5 border border-white/10 rounded-xl
                text-[var(--foreground)] font-medium text-sm
                hover:bg-white/10 transition-all duration-200
              "
            >
              Clear all filters
            </button>
          ) : (
            <Link
              href="/webhooks"
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                bg-[var(--drip-cyan)]/10 border border-[var(--drip-cyan)]/20 rounded-xl
                text-[var(--drip-cyan)] font-medium text-sm
                hover:bg-[var(--drip-cyan)]/20 transition-all duration-200
              "
            >
              <Bell className="h-4 w-4" />
              Set up alerts
            </Link>
          )}
        </div>
      )}

      {/* Drops Grid - staggered animation feel */}
      {!loading && drops.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop, index) => (
            <div
              key={drop.id}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              className="animate-[fadeIn_0.3s_ease-out_forwards] opacity-0"
            >
              <DropCard drop={drop} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
