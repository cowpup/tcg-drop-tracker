"use client";

import { useState, useEffect } from "react";
import { Card, Badge, LoadingSpinner } from "@/components/ui";
import { RetailerLabels } from "@/types";
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface RetailerStatus {
  id: string;
  status: "normal" | "elevated" | "queue";
  lastChecked: string | null;
  queueActive: boolean;
  securityLevel: "standard" | "elevated";
  url: string;
  activeSignals: number;
}

const statusConfig = {
  normal: { label: "Normal", variant: "success" as const, icon: ShieldCheck },
  elevated: { label: "Elevated Security", variant: "warning" as const, icon: ShieldAlert },
  queue: { label: "Queue Active", variant: "danger" as const, icon: Radio },
};

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<RetailerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const res = await fetch("/api/retailers/status");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRetailers(data.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError("Failed to load retailer status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Retailer Status
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live monitoring of retailer security status and queue detection
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </Card>
      )}

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
                  {retailer.lastChecked
                    ? new Date(retailer.lastChecked).toLocaleTimeString()
                    : "Not monitored yet"}
                </span>
              </div>

              {retailer.activeSignals > 0 && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  {retailer.activeSignals} active signal{retailer.activeSignals > 1 ? "s" : ""} in last 24h
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {retailers.length === 0 && !error && (
        <Card className="py-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No retailers are being monitored yet. Add monitors in the admin panel.
          </p>
        </Card>
      )}

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

      {/* Last refresh indicator */}
      {lastRefresh && (
        <p className="text-center text-xs text-gray-400">
          Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 60 seconds
        </p>
      )}
    </div>
  );
}
