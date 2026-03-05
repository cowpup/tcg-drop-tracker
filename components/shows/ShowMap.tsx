"use client";

import { useMemo } from "react";
import type { TradeShow } from "@/types";
import { ShowTierLabels } from "@/types";
import { differenceInDays, format } from "date-fns";
import { MapPin, ExternalLink } from "lucide-react";

interface ShowMapProps {
  shows: TradeShow[];
}

export function ShowMap({ shows }: ShowMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Filter shows with coordinates
  const mappableShows = useMemo(
    () => shows.filter((s) => s.lat && s.lng),
    [shows]
  );

  const getProximityColor = (show: TradeShow) => {
    const daysUntil = differenceInDays(new Date(show.startDate), new Date());
    if (daysUntil < 7) return "text-red-500";
    if (daysUntil < 30) return "text-amber-500";
    return "text-green-500";
  };

  // Generate a static Mapbox image URL if token is available
  const getStaticMapUrl = () => {
    if (!mapboxToken || mappableShows.length === 0) return null;

    // Create marker pins for the static map
    const markers = mappableShows
      .slice(0, 50) // Limit markers for URL length
      .map((show) => {
        const daysUntil = differenceInDays(new Date(show.startDate), new Date());
        const color = daysUntil < 7 ? "f44" : daysUntil < 30 ? "fa0" : "2a2";
        return `pin-s+${color}(${show.lng},${show.lat})`;
      })
      .join(",");

    // Calculate bounds
    const lats = mappableShows.map((s) => s.lat!);
    const lngs = mappableShows.map((s) => s.lng!);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${markers}/${centerLng},${centerLat},3,0/800x400@2x?access_token=${mapboxToken}`;
  };

  const staticMapUrl = getStaticMapUrl();

  if (!mapboxToken) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Map unavailable - NEXT_PUBLIC_MAPBOX_TOKEN not configured
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Add your Mapbox token to .env to enable the interactive map
          </p>
        </div>
      </div>
    );
  }

  if (mappableShows.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            No shows with location data
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Shows will appear on the map once geocoded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Static Map Image */}
      {staticMapUrl && (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <img
            src={staticMapUrl}
            alt="Trade show locations map"
            className="h-[400px] w-full object-cover"
          />
        </div>
      )}

      {/* Show pins as a visual list below */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {mappableShows.slice(0, 9).map((show) => (
          <div
            key={show.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <MapPin className={`h-5 w-5 flex-shrink-0 ${getProximityColor(show)}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 dark:text-white">
                {show.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {show.city}, {show.state} &middot;{" "}
                {format(new Date(show.startDate), "MMM d")}
              </p>
            </div>
            {show.website && (
              <a
                href={show.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ))}
      </div>
      {mappableShows.length > 9 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          +{mappableShows.length - 9} more events (see list below)
        </p>
      )}
    </div>
  );
}
