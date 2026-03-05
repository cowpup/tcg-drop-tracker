"use client";

import { Card, Badge } from "@/components/ui";
import { RetailerLabels } from "@/types";
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Clock,
} from "lucide-react";

// Placeholder data - in production this would come from live monitoring
const retailers = [
  {
    id: "POKEMON_CENTER",
    status: "normal",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "standard",
    url: "https://www.pokemoncenter.com",
  },
  {
    id: "TARGET",
    status: "normal",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "standard",
    url: "https://www.target.com",
  },
  {
    id: "WALMART",
    status: "elevated",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "elevated",
    url: "https://www.walmart.com",
  },
  {
    id: "AMAZON",
    status: "normal",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "standard",
    url: "https://www.amazon.com",
  },
  {
    id: "GAMESTOP",
    status: "normal",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "standard",
    url: "https://www.gamestop.com",
  },
  {
    id: "BEST_BUY",
    status: "normal",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "standard",
    url: "https://www.bestbuy.com",
  },
  {
    id: "TCG_PLAYER",
    status: "normal",
    lastChecked: new Date(),
    queueActive: false,
    securityLevel: "standard",
    url: "https://www.tcgplayer.com",
  },
];

const statusConfig = {
  normal: { label: "Normal", variant: "success" as const, icon: ShieldCheck },
  elevated: { label: "Elevated Security", variant: "warning" as const, icon: ShieldAlert },
  queue: { label: "Queue Active", variant: "danger" as const, icon: Radio },
};

export default function RetailersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Retailer Status
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Live monitoring of retailer security status and queue detection
        </p>
      </div>

      {/* Status Legend */}
      <Card>
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Status Indicators
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Normal - Standard access
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Elevated - Enhanced bot protection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Queue - Virtual waiting room active
            </span>
          </div>
        </div>
      </Card>

      {/* Retailer Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {retailers.map((retailer) => {
          const status = retailer.queueActive
            ? statusConfig.queue
            : retailer.securityLevel === "elevated"
              ? statusConfig.elevated
              : statusConfig.normal;
          const StatusIcon = status.icon;

          return (
            <Card key={retailer.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      status.variant === "success"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : status.variant === "warning"
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <StatusIcon
                      className={`h-5 w-5 ${
                        status.variant === "success"
                          ? "text-green-600 dark:text-green-400"
                          : status.variant === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {RetailerLabels[retailer.id] || retailer.id}
                    </h3>
                    <Badge variant={status.variant} size="sm">
                      {status.label}
                    </Badge>
                  </div>
                </div>
                <a
                  href={retailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Last checked:{" "}
                  {retailer.lastChecked.toLocaleTimeString()}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-200">
              About Security Monitoring
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              We monitor retailer websites every 3 minutes to detect security
              changes and queue activation. When we detect elevated security
              (like Cloudflare protection) or a virtual waiting room, it often
              indicates an upcoming high-demand drop. Enable notifications to
              get alerted when status changes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
