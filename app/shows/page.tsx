"use client";

import { useState } from "react";
import { useShows } from "@/hooks";
import { ShowCard, ShowMap } from "@/components/shows";
import { Card, LoadingSpinner, FilterBar, SelectFilter, ClearFiltersButton } from "@/components/ui";
import { ShowType, ShowTier, ShowTypeLabels, ShowTierLabels } from "@/types";
import { AlertCircle, RefreshCw, Map, List } from "lucide-react";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const stateOptions = US_STATES.map((s) => ({ value: s, label: s }));

const showTypeOptions = Object.values(ShowType).map((t) => ({
  value: t,
  label: ShowTypeLabels[t] || t,
}));

const tierOptions = Object.values(ShowTier).map((t) => ({
  value: t,
  label: ShowTierLabels[t] || t,
}));

export default function ShowsPage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [filters, setFilters] = useState({
    state: "",
    showType: "",
    tier: "",
  });

  const { shows, loading, error, refetch } = useShows({
    ...filters,
    upcoming: true,
  });

  const clearFilters = () => {
    setFilters({ state: "", showType: "", tier: "" });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trade Shows & Events
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Find card shows, conventions, and events near you
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "map"
                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar>
        <SelectFilter
          label="State"
          value={filters.state}
          options={stateOptions}
          onChange={(value) => setFilters((f) => ({ ...f, state: value }))}
        />
        <SelectFilter
          label="Type"
          value={filters.showType}
          options={showTypeOptions}
          onChange={(value) => setFilters((f) => ({ ...f, showType: value }))}
        />
        <SelectFilter
          label="Tier"
          value={filters.tier}
          options={tierOptions}
          onChange={(value) => setFilters((f) => ({ ...f, tier: value }))}
        />
        {hasActiveFilters && <ClearFiltersButton onClick={clearFilters} />}
      </FilterBar>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h3 className="mt-3 text-lg font-medium text-red-800 dark:text-red-200">
            Failed to load shows
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
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Map View */}
      {!loading && !error && viewMode === "map" && (
        <ShowMap shows={shows} />
      )}

      {/* List View / Always Show List Below Map */}
      {!loading && !error && (
        <div className="space-y-4">
          {viewMode === "map" && shows.length > 0 && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Events ({shows.length})
            </h2>
          )}

          {shows.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  No shows found
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Check back later for upcoming events"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Legend */}
      {!loading && !error && viewMode === "map" && (
        <Card>
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Map Legend
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                30+ days away
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                7-30 days away
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Less than 7 days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                National Event
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
