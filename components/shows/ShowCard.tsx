import { Card, Badge } from "@/components/ui";
import { ShowTypeLabels, ShowTierLabels } from "@/types";
import type { TradeShow } from "@/types";
import { format, differenceInDays } from "date-fns";
import { MapPin, Calendar, ExternalLink, Ticket } from "lucide-react";

interface ShowCardProps {
  show: TradeShow;
}

export function ShowCard({ show }: ShowCardProps) {
  const daysUntil = differenceInDays(new Date(show.startDate), new Date());

  const proximityColor =
    daysUntil < 7
      ? "danger"
      : daysUntil < 30
        ? "warning"
        : "success";

  return (
    <Card hover padding="md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {show.name}
            </h3>
            {show.featured && (
              <Badge variant="primary" size="sm">
                Featured
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="default" size="sm">
              {ShowTypeLabels[show.showType] || show.showType}
            </Badge>
            <Badge variant="default" size="sm">
              {ShowTierLabels[show.tier] || show.tier}
            </Badge>
            <Badge variant={proximityColor} size="sm">
              {daysUntil === 0
                ? "Today"
                : daysUntil === 1
                  ? "Tomorrow"
                  : daysUntil < 0
                    ? "Past"
                    : `${daysUntil} days`}
            </Badge>
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {format(new Date(show.startDate), "MMM d")} -{" "}
                {format(new Date(show.endDate), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                {show.venueName}, {show.city}, {show.state}
              </span>
            </div>
          </div>

          {show.description && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {show.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Links */}
      <div className="mt-4 flex gap-2">
        {show.website && (
          <a
            href={show.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Website
          </a>
        )}
        {show.ticketUrl && (
          <a
            href={show.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Ticket className="h-3.5 w-3.5" />
            Tickets
          </a>
        )}
      </div>
    </Card>
  );
}
