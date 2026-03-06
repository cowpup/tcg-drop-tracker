"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Badge, LoadingSpinner } from "@/components/ui";
import { RetailerLabels, SignalTypeLabels } from "@/types";
import {
  Radio,
  Database,
  ShieldAlert,
  RefreshCw,
  Package,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface Signal {
  id: string;
  retailer: string;
  type: string;
  url: string;
  metadata: Record<string, unknown>;
  detectedAt: string;
  notified: boolean;
  drop: {
    id: string;
    status: string;
    product: {
      name: string;
    };
  } | null;
}

const signalTypeConfig: Record<string, { color: string; icon: typeof Radio }> = {
  RESTOCK: { color: "success", icon: Package },
  QUEUE_DETECTED: { color: "danger", icon: Radio },
  SECURITY_ESCALATED: { color: "warning", icon: ShieldAlert },
  PRICE_CHANGE: { color: "info", icon: RefreshCw },
  NEW_LISTING: { color: "success", icon: Package },
};

export default function AdminSignalsPage() {
  const { userId, isLoaded } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  useEffect(() => {
    async function fetchSignals() {
      try {
        const res = await fetch(`/api/signals?page=${pagination.page}&limit=50`);
        const data = await res.json();
        setSignals(data.data || []);
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
      } catch (error) {
        console.error("Failed to fetch signals:", error);
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) fetchSignals();
  }, [isAdmin, pagination.page]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Database className="h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Admin Access Required
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Signals
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Automated detections from retailer monitoring (read-only)
        </p>
      </div>

      {/* Signal Type Legend */}
      <Card>
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Signal Types
        </h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(SignalTypeLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Badge variant={signalTypeConfig[key]?.color as "success" | "warning" | "danger" | "default" || "default"} size="sm">
                {label}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Signals Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Signals ({pagination.total})
          </h2>
        </div>

        {signals.length === 0 ? (
          <div className="py-8 text-center">
            <Radio className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No signals detected yet. Signals are created when the scraper detects queue activation, security changes, or restocks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Retailer</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Product</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Detected</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Notified</th>
                  <th className="pb-2 text-right font-medium text-gray-500">URL</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((signal) => (
                  <tr key={signal.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">
                      <Badge
                        variant={signalTypeConfig[signal.type]?.color as "success" | "warning" | "danger" | "default" || "default"}
                        size="sm"
                      >
                        {SignalTypeLabels[signal.type] || signal.type}
                      </Badge>
                    </td>
                    <td className="py-2 text-gray-900 dark:text-white">
                      {RetailerLabels[signal.retailer] || signal.retailer}
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {signal.drop?.product?.name || "-"}
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {new Date(signal.detectedAt).toLocaleString()}
                    </td>
                    <td className="py-2">
                      {signal.notified ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
