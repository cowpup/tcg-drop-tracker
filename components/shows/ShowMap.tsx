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

// Time proximity filters
const TIME_FILTERS = [
  { id: "all", label: "All", color: null },
  { id: "week", label: "This Week", color: "#ef4444" },
  { id: "month", label: "This Month", color: "#f59e0b" },
  { id: "later", label: "30+ Days", color: "#22c55e" },
];

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
  const [selectedTime, setSelectedTime] = useState("all");
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Filter shows with coordinates
  const mappableShows = useMemo(
    () => shows.filter((s) => s.lat && s.lng),
    [shows]
  );

  // Get proximity category for a show
  const getTimeCategory = (show: TradeShow) => {
    const daysUntil = differenceInDays(new Date(show.startDate), new Date());
    if (daysUntil < 7) return "week";
    if (daysUntil < 30) return "month";
    return "later";
  };

  // Filter by selected game type and time
  const filteredShows = useMemo(() => {
    let filtered = mappableShows;

    // Filter by time
    if (selectedTime !== "all") {
      filtered = filtered.filter((show) => getTimeCategory(show) === selectedTime);
    }

    // Filter by game
    if (selectedGame !== "all") {
      const keywords = GAME_KEYWORDS[selectedGame] || [];
      filtered = filtered.filter((show) => {
        const searchText = `${show.name} ${show.description || ""} ${show.showType}`.toLowerCase();
        return keywords.some((kw) => searchText.includes(kw));
      });
    }

    return filtered;
  }, [mappableShows, selectedGame, selectedTime]);

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
      style: "mapbox://styles/mapbox/dark-v11",
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

    // Group shows by location (round to ~100m precision to catch same-venue shows)
    const locationGroups = new Map<string, TradeShow[]>();
    filteredShows.forEach((show) => {
      const key = `${show.lat?.toFixed(3)},${show.lng?.toFixed(3)}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(show);
    });

    // Sort location groups by soonest show date (furthest first, so soonest added last = on top)
    const sortedGroups = Array.from(locationGroups.values()).sort((a, b) => {
      const aMin = Math.min(...a.map((s) => new Date(s.startDate).getTime()));
      const bMin = Math.min(...b.map((s) => new Date(s.startDate).getTime()));
      return bMin - aMin; // Furthest first, soonest last (will be on top)
    });

    // Create markers for each location group
    sortedGroups.forEach((showsAtLocation) => {
      // Sort by date
      showsAtLocation.sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const firstShow = showsAtLocation[0];
      const hasMultiple = showsAtLocation.length > 1;

      // Use the color of the soonest show
      const { color } = getProximityInfo(firstShow);

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.cssText = `
        width: ${hasMultiple ? 32 : 28}px;
        height: ${hasMultiple ? 32 : 28}px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      `;

      // Show count if multiple shows
      if (hasMultiple) {
        el.textContent = String(showsAtLocation.length);
      }

      // Build popup HTML
      let popupHtml: string;

      if (hasMultiple) {
        // Multiple shows - show list
        popupHtml = `
          <div style="min-width: 260px; max-height: 300px; overflow-y: auto; font-family: system-ui, sans-serif; background: #161b22; color: #e6edf3; padding: 12px; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px;">
              ${showsAtLocation.length} events at this venue
            </p>
            ${showsAtLocation.map((show) => {
              const { color: showColor } = getProximityInfo(show);
              const daysUntil = differenceInDays(new Date(show.startDate), new Date());
              return `
                <div style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${showColor}; flex-shrink: 0;"></span>
                    <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #e6edf3;">
                      ${show.name}
                    </h4>
                  </div>
                  <p style="margin: 0 0 4px 18px; font-size: 12px; font-weight: 500; color: #c9d1d9;">
                    ${format(new Date(show.startDate), "MMM d")} - ${format(new Date(show.endDate), "MMM d, yyyy")}
                  </p>
                  <p style="margin: 0 0 4px 18px; font-size: 11px; color: ${showColor};">
                    ${daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days away`}
                  </p>
                  ${show.website ? `
                    <a href="${show.website}" target="_blank" rel="noopener noreferrer"
                       style="display: inline-block; margin-left: 18px; font-size: 11px; color: #00d4ff; text-decoration: none;">
                      Website →
                    </a>
                  ` : ""}
                </div>
              `;
            }).join("")}
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #8b949e;">
              ${firstShow.venueName}<br/>${firstShow.city}, ${firstShow.state}
            </p>
          </div>
        `;
      } else {
        // Single show - original popup
        const show = firstShow;
        const daysUntil = differenceInDays(new Date(show.startDate), new Date());
        popupHtml = `
          <div style="min-width: 220px; font-family: system-ui, sans-serif; background: #161b22; color: #e6edf3; padding: 12px; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #e6edf3;">
              ${show.name}
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #8b949e;">
              ${show.venueName}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #8b949e;">
              ${show.city}, ${show.state}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 500; color: #c9d1d9;">
              ${format(new Date(show.startDate), "MMM d")} - ${format(new Date(show.endDate), "MMM d, yyyy")}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: ${color}; font-weight: 500;">
              ${daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days away`}
            </p>
            ${show.website ? `
              <a href="${show.website}" target="_blank" rel="noopener noreferrer"
                 style="display: inline-block; margin-top: 4px; font-size: 12px; color: #00d4ff; text-decoration: none;">
                Visit Website →
              </a>
            ` : ""}
          </div>
        `;
      }

      const popup = new mapboxgl.Popup({
        offset: [0, -14],
        anchor: "bottom",
        closeButton: true,
        closeOnClick: true,
        maxWidth: hasMultiple ? "320px" : "280px"
      }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([firstShow.lng!, firstShow.lat!])
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
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-white/10 bg-[var(--background-elevated)]">
        <div className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-[var(--foreground-muted)]" />
          <p className="mt-3 text-[var(--foreground-muted)]">
            Map unavailable - NEXT_PUBLIC_MAPBOX_TOKEN not configured
          </p>
        </div>
      </div>
    );
  }

  if (mappableShows.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-white/10 bg-[var(--background-elevated)]">
        <div className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-[var(--foreground-muted)]" />
          <p className="mt-3 text-[var(--foreground-muted)]">
            No shows with location data
          </p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Import shows and run geocoding from the admin panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground-muted)]">When:</span>
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedTime(filter.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTime === filter.id
                  ? "bg-[var(--drip-cyan)] text-[var(--background)]"
                  : "bg-white/5 text-[var(--foreground-muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
              }`}
            >
              {filter.color && (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: filter.color }}
                />
              )}
              {filter.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Game Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground-muted)]">Type:</span>
          {GAME_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedGame(filter.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedGame === filter.id
                  ? "bg-[var(--drip-cyan)] text-[var(--background)]"
                  : "bg-white/5 text-[var(--foreground-muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative overflow-hidden rounded-lg border border-white/10">
        <div ref={mapContainer} className="h-[450px] w-full" />

        {/* Legend - positioned above Mapbox logo */}
        <div className="absolute bottom-12 left-4 rounded-lg bg-[#161b22]/95 p-3 shadow-lg backdrop-blur-sm border border-white/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            Legend
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span className="text-xs text-[var(--foreground)]">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span className="text-xs text-[var(--foreground)]">This Month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-xs text-[var(--foreground)]">30+ Days</span>
            </div>
          </div>
        </div>

        {/* Show count */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-[#161b22]/95 px-3 py-2 shadow-lg backdrop-blur-sm border border-white/10">
          <p className="text-sm font-medium text-[var(--foreground)]">
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
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[var(--background-elevated)] p-3 hover:border-[var(--drip-cyan)]/30 transition-colors"
            >
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--foreground)]">
                  {show.name}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {show.city}, {show.state} · {format(new Date(show.startDate), "MMM d")}
                </p>
              </div>
              {show.website && (
                <a
                  href={show.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-[var(--foreground-muted)] hover:bg-white/5 hover:text-[var(--drip-cyan)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>
      {filteredShows.length > 9 && (
        <p className="text-center text-sm text-[var(--foreground-muted)]">
          +{filteredShows.length - 9} more shows
        </p>
      )}
    </div>
  );
}
