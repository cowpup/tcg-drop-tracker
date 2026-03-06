"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TradeShow } from "@/types";
import { differenceInDays, format } from "date-fns";
import { MapPin, ExternalLink, Filter } from "lucide-react";

interface ShowMapProps {
  shows: TradeShow[];
}

// Game types for filtering
const GAME_FILTERS = [
  { id: "all", label: "All Shows" },
  { id: "pokemon", label: "Pokemon" },
  { id: "sports", label: "Sports Cards" },
  { id: "mtg", label: "Magic: The Gathering" },
  { id: "tcg", label: "TCG (General)" },
  { id: "anime", label: "Anime/Pop Culture" },
];

// Keywords to match shows to game types
const GAME_KEYWORDS: Record<string, string[]> = {
  pokemon: ["pokemon", "pokémon", "pikachu"],
  sports: ["sports", "baseball", "football", "basketball", "national"],
  mtg: ["magic", "mtg", "gathering"],
  tcg: ["tcg", "trading card", "card show", "card game"],
  anime: ["anime", "comic", "pop culture", "collect-a-con"],
};

export function ShowMap({ shows }: ShowMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedGame, setSelectedGame] = useState("all");
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Filter shows with coordinates
  const mappableShows = useMemo(
    () => shows.filter((s) => s.lat && s.lng),
    [shows]
  );

  // Filter by selected game type
  const filteredShows = useMemo(() => {
    if (selectedGame === "all") return mappableShows;

    const keywords = GAME_KEYWORDS[selectedGame] || [];
    return mappableShows.filter((show) => {
      const searchText = `${show.name} ${show.description || ""} ${show.showType}`.toLowerCase();
      return keywords.some((kw) => searchText.includes(kw));
    });
  }, [mappableShows, selectedGame]);

  const getProximityInfo = (show: TradeShow) => {
    const daysUntil = differenceInDays(new Date(show.startDate), new Date());
    if (daysUntil < 7) return { color: "#ef4444", label: "This Week" };
    if (daysUntil < 30) return { color: "#f59e0b", label: "This Month" };
    return { color: "#22c55e", label: "Upcoming" };
  };

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-98.5795, 39.8283], // US center
      zoom: 3,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update markers when filtered shows change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredShows.forEach((show) => {
      const { color } = getProximityInfo(show);
      const daysUntil = differenceInDays(new Date(show.startDate), new Date());

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Create popup with proper anchor
      const popup = new mapboxgl.Popup({
        offset: [0, -14],
        anchor: "bottom",
        closeButton: true,
        closeOnClick: true,
        maxWidth: "280px"
      }).setHTML(`
        <div style="min-width: 220px; font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111;">
            ${show.name}
          </h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
            ${show.venueName}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
            ${show.city}, ${show.state}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 500; color: #111;">
            ${format(new Date(show.startDate), "MMM d")} - ${format(new Date(show.endDate), "MMM d, yyyy")}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: ${color}; font-weight: 500;">
            ${daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days away`}
          </p>
          ${show.website ? `
            <a href="${show.website}" target="_blank" rel="noopener noreferrer"
               style="display: inline-block; margin-top: 4px; font-size: 12px; color: #2563eb; text-decoration: none;">
              Visit Website →
            </a>
          ` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([show.lng!, show.lat!])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to markers
    if (filteredShows.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredShows.forEach((show) => {
        bounds.extend([show.lng!, show.lat!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 6 });
    }
  }, [filteredShows]);

  if (!mapboxToken) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Map unavailable - NEXT_PUBLIC_MAPBOX_TOKEN not configured
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
            Import shows and run geocoding from the admin panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
        {GAME_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedGame(filter.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedGame === filter.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div ref={mapContainer} className="h-[450px] w-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:bg-gray-800/95">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Legend
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-700 dark:text-gray-300">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span className="text-xs text-gray-700 dark:text-gray-300">This Month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-700 dark:text-gray-300">30+ Days</span>
            </div>
          </div>
        </div>

        {/* Show count */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-800/95">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filteredShows.length} {filteredShows.length === 1 ? "show" : "shows"}
          </p>
        </div>
      </div>

      {/* Show list below map */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filteredShows.slice(0, 9).map((show) => {
          const { color } = getProximityInfo(show);
          return (
            <div
              key={show.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">
                  {show.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {show.city}, {show.state} · {format(new Date(show.startDate), "MMM d")}
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
          );
        })}
      </div>
      {filteredShows.length > 9 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          +{filteredShows.length - 9} more shows
        </p>
      )}
    </div>
  );
}
