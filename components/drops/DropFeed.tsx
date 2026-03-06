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
import { RefreshCw } from "lucide-react";
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
      <div className="py-16 text-center">
        <p className="text-red-400 mb-4">Something broke. Our bad.</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state - simple, not a big card */}
      {!loading && drops.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {hasActiveFilters ? "Nothing matches" : "No drops right now"}
          </p>
          <p className="text-[var(--foreground-muted)] mb-6">
            {hasActiveFilters
              ? "Try different filters?"
              : "We're watching. You'll know when something drops."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="text-[var(--drip-cyan)] hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/webhooks"
              className="text-[var(--drip-cyan)] hover:underline"
            >
              Get notified when drops go live →
            </Link>
          )}
        </div>
      )}

      {/* Drops grid */}
      {!loading && drops.length > 0 && (
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  );
}
