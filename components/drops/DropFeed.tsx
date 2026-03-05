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
import { AlertCircle, RefreshCw } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-3 text-lg font-medium text-red-800 dark:text-red-200">
          Failed to load drops
        </h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!loading && drops.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No drops found
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "Check back later for upcoming drops"}
          </p>
        </div>
      )}

      {/* Drops Grid */}
      {!loading && drops.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  );
}
