"use client";

import { useState, useMemo } from "react";
import { useDrops, useShows } from "@/hooks";
import { Card, Badge, LoadingSpinner, Button, Modal } from "@/components/ui";
import { GameLabels, RetailerLabels, DropTypeLabels, ShowTypeLabels } from "@/types";
import type { TradeShow } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight, Download, Link as LinkIcon, ExternalLink, MapPin } from "lucide-react";

const gameColors: Record<string, string> = {
  POKEMON: "bg-blue-500",
  MTG: "bg-cyan-500",
  YUGIOH: "bg-amber-500",
  LORCANA: "bg-green-500",
  ONEPIECE: "bg-red-500",
  SPORTS: "bg-gray-500",
  OTHER: "bg-gray-400",
};

// Trade show color - purple to stand out from drops
const SHOW_COLOR = "bg-purple-600";

interface Drop {
  id: string;
  retailer: string;
  dropType: string;
  status: string;
  scheduledAt: Date | string | null;
  url: string | null;
  price: number | null;
  notes: string | null;
  product: {
    id: string;
    name: string;
    game: string;
    type: string;
    imageUrl: string | null;
    msrp: number | null;
  };
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [selectedShow, setSelectedShow] = useState<TradeShow | null>(null);
  const [showPastDrops, setShowPastDrops] = useState(false);
  const { drops, loading } = useDrops({ upcoming: true, limit: 100 });
  const { drops: pastDrops, loading: pastLoading } = useDrops({ past: true, limit: 50 });
  const { shows, loading: showsLoading } = useShows({ upcoming: true, limit: 100 });

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dropsByDate = useMemo(() => {
    const map = new Map<string, Drop[]>();
    drops.forEach((drop) => {
      if (drop.scheduledAt) {
        const key = format(new Date(drop.scheduledAt), "yyyy-MM-dd");
        const existing = map.get(key) || [];
        map.set(key, [...existing, drop]);
      }
    });
    return map;
  }, [drops]);

  // Get shows that overlap with a given day (shows can span multiple days)
  const getShowsForDay = (day: Date): TradeShow[] => {
    return shows.filter((show) => {
      const start = new Date(show.startDate);
      const end = new Date(show.endDate);
      // Check if day falls within show dates (inclusive)
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
    });
  };

  const startDay = startOfMonth(currentMonth).getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => i);

  const calendarUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar`;

  const copyCalendarUrl = () => {
    navigator.clipboard.writeText(calendarUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Drop Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View upcoming drops and add them to your calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyCalendarUrl}
          >
            <LinkIcon className="h-4 w-4" />
            Copy iCal URL
          </Button>
          <a href="/api/calendar" download="tcg-drops.ics">
            <Button variant="primary" size="sm">
              <Download className="h-4 w-4" />
              Download .ics
            </Button>
          </a>
        </div>
      </div>

      {/* Month Navigation */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Card>

      {/* Calendar Grid */}
      {loading || showsLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Card padding="none">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Padding for first week */}
            {paddingDays.map((i) => (
              <div key={`pad-${i}`} className="min-h-24 border-b border-r border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
            ))}

            {/* Actual days */}
            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayDrops = dropsByDate.get(dateKey) || [];
              const dayShows = getShowsForDay(day);
              const today = isToday(day);
              const totalItems = dayDrops.length + dayShows.length;
              const maxVisible = 3;

              return (
                <div
                  key={dateKey}
                  className={`min-h-24 border-b border-r border-gray-100 p-1 dark:border-gray-800 ${
                    today ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div
                    className={`mb-1 text-right text-sm ${
                      today
                        ? "font-bold text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {/* Trade Shows first (purple) */}
                    {dayShows.slice(0, maxVisible).map((show) => (
                      <button
                        key={show.id}
                        onClick={() => setSelectedShow(show)}
                        className={`w-full truncate rounded px-1 py-0.5 text-left text-xs text-white transition-opacity hover:opacity-80 ${SHOW_COLOR} flex items-center gap-1`}
                        title={`${show.name} - ${show.city}, ${show.state}`}
                      >
                        <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate">{show.name}</span>
                      </button>
                    ))}
                    {/* Drops after shows */}
                    {dayDrops.slice(0, Math.max(0, maxVisible - dayShows.length)).map((drop) => (
                      <button
                        key={drop.id}
                        onClick={() => setSelectedDrop(drop)}
                        className={`w-full truncate rounded px-1 py-0.5 text-left text-xs text-white transition-opacity hover:opacity-80 ${
                          gameColors[drop.product.game] || "bg-gray-500"
                        }`}
                        title={`${drop.product.name} at ${RetailerLabels[drop.retailer]}`}
                      >
                        {drop.product.name}
                      </button>
                    ))}
                    {totalItems > maxVisible && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{totalItems - maxVisible} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          {/* Trade Shows */}
          <div className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${SHOW_COLOR}`} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Trade Shows
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          {/* Game Drops */}
          {Object.entries(gameColors).map(([game, color]) => (
            <div key={game} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded ${color}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {GameLabels[game] || game}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Past Drops History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Drop History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Past drops to identify restock patterns and trends
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPastDrops(!showPastDrops)}
          >
            {showPastDrops ? "Hide History" : "Show History"}
          </Button>
        </div>

        {showPastDrops && (
          <div className="space-y-3">
            {pastLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : pastDrops.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No past drops recorded yet
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 text-left font-medium text-gray-500">Date</th>
                        <th className="pb-2 text-left font-medium text-gray-500">Product</th>
                        <th className="pb-2 text-left font-medium text-gray-500">Retailer</th>
                        <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                        <th className="pb-2 text-left font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastDrops.map((drop) => (
                        <tr
                          key={drop.id}
                          className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setSelectedDrop(drop)}
                        >
                          <td className="py-2 text-gray-600 dark:text-gray-400">
                            {drop.scheduledAt
                              ? format(new Date(drop.scheduledAt), "MMM d, yyyy")
                              : "-"}
                          </td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${gameColors[drop.product.game] || "bg-gray-400"}`} />
                              <span className="text-gray-900 dark:text-white">{drop.product.name}</span>
                            </div>
                          </td>
                          <td className="py-2">
                            <Badge variant="default" size="sm">
                              {RetailerLabels[drop.retailer] || drop.retailer}
                            </Badge>
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-400">
                            {DropTypeLabels[drop.dropType] || drop.dropType}
                          </td>
                          <td className="py-2">
                            <Badge
                              variant={drop.status === "SOLD_OUT" ? "warning" : drop.status === "CANCELLED" ? "danger" : "default"}
                              size="sm"
                            >
                              {drop.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Click any row for details. Showing last {pastDrops.length} drops.
                </p>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Drop Detail Modal */}
      <Modal
        isOpen={!!selectedDrop}
        onClose={() => setSelectedDrop(null)}
        title="Drop Details"
      >
        {selectedDrop && (
          <div className="space-y-4">
            {/* Product Image */}
            {selectedDrop.product.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={selectedDrop.product.imageUrl}
                  alt={selectedDrop.product.name}
                  className="h-48 w-auto rounded-lg object-contain"
                />
              </div>
            )}

            {/* Product Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedDrop.product.name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default">{GameLabels[selectedDrop.product.game]}</Badge>
                <Badge variant="default">{selectedDrop.product.type}</Badge>
              </div>
            </div>

            {/* Drop Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Retailer</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {RetailerLabels[selectedDrop.retailer] || selectedDrop.retailer}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Drop Type</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {DropTypeLabels[selectedDrop.dropType] || selectedDrop.dropType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={selectedDrop.status === "LIVE" ? "success" : "default"}>
                  {selectedDrop.status}
                </Badge>
              </div>
              {selectedDrop.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedDrop.scheduledAt), "PPp")}
                  </span>
                </div>
              )}
              {(selectedDrop.price || selectedDrop.product.msrp) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(selectedDrop.price || selectedDrop.product.msrp)?.toFixed(2)}
                  </span>
                </div>
              )}
              {selectedDrop.notes && (
                <div className="mt-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">{selectedDrop.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {selectedDrop.url && (
                <a
                  href={selectedDrop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="primary" className="w-full">
                    <ExternalLink className="h-4 w-4" />
                    View at {RetailerLabels[selectedDrop.retailer] || "Retailer"}
                  </Button>
                </a>
              )}
              <Button variant="outline" onClick={() => setSelectedDrop(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Trade Show Detail Modal */}
      <Modal
        isOpen={!!selectedShow}
        onClose={() => setSelectedShow(null)}
        title="Trade Show Details"
      >
        {selectedShow && (
          <div className="space-y-4">
            {/* Show Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-4 w-4 rounded ${SHOW_COLOR}`} />
                <Badge variant="default">{ShowTypeLabels[selectedShow.showType] || selectedShow.showType}</Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedShow.name}
              </h3>
              {selectedShow.organizer && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  by {selectedShow.organizer}
                </p>
              )}
            </div>

            {/* Show Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(selectedShow.startDate), "MMM d")} - {format(new Date(selectedShow.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue</span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {selectedShow.venueName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedShow.city}, {selectedShow.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px]">
                  {selectedShow.address}
                </span>
              </div>
              {selectedShow.description && (
                <div className="mt-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">{selectedShow.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {selectedShow.website && (
                <a
                  href={selectedShow.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="primary" className="w-full">
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                </a>
              )}
              {selectedShow.ticketUrl && (
                <a
                  href={selectedShow.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    Get Tickets
                  </Button>
                </a>
              )}
              <Button variant="outline" onClick={() => setSelectedShow(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
