"use client";

import { useState, useMemo } from "react";
import { useDrops } from "@/hooks";
import { Card, Badge, LoadingSpinner, Button, Modal } from "@/components/ui";
import { GameLabels, RetailerLabels, DropTypeLabels } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Download, Link as LinkIcon, ExternalLink, X } from "lucide-react";

const gameColors: Record<string, string> = {
  POKEMON: "bg-blue-500",
  MTG: "bg-cyan-500",
  YUGIOH: "bg-amber-500",
  LORCANA: "bg-green-500",
  ONEPIECE: "bg-red-500",
  SPORTS: "bg-gray-500",
  OTHER: "bg-gray-400",
};

interface Drop {
  id: string;
  retailer: string;
  dropType: string;
  status: string;
  scheduledAt: string | null;
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
  const { drops, loading } = useDrops({ upcoming: true, limit: 100 });

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
      {loading ? (
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
              const today = isToday(day);

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
                    {dayDrops.slice(0, 3).map((drop) => (
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
                    {dayDrops.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayDrops.length - 3} more
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
        <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
