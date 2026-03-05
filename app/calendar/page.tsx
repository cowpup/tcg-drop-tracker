"use client";

import { useState, useMemo } from "react";
import { useDrops } from "@/hooks";
import { Card, Badge, LoadingSpinner, Button } from "@/components/ui";
import { GameLabels, RetailerLabels } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Download, Link as LinkIcon } from "lucide-react";

const gameColors: Record<string, string> = {
  POKEMON: "bg-blue-500",
  MTG: "bg-cyan-500",
  YUGIOH: "bg-amber-500",
  LORCANA: "bg-green-500",
  ONEPIECE: "bg-red-500",
  SPORTS: "bg-gray-500",
  OTHER: "bg-gray-400",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { drops, loading } = useDrops({ upcoming: true, limit: 100 });

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dropsByDate = useMemo(() => {
    const map = new Map<string, typeof drops>();
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
                      <div
                        key={drop.id}
                        className={`truncate rounded px-1 py-0.5 text-xs text-white ${
                          gameColors[drop.product.game] || "bg-gray-500"
                        }`}
                        title={`${drop.product.name} at ${RetailerLabels[drop.retailer]}`}
                      >
                        {drop.product.name}
                      </div>
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
    </div>
  );
}
