"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Badge, LoadingSpinner, Button } from "@/components/ui";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface JobLog {
  id: string;
  jobType: string;
  status: string;
  duration: number;
  itemsChecked: number;
  itemsFound: number;
  errors: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function JobsPage() {
  const { userId } = useAuth();
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/jobs?jobType=${filter}` : "/api/jobs";
      const res = await fetch(url);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, [isAdmin, filter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "error":
        return <Badge variant="danger">Error</Badge>;
      case "partial":
        return <Badge variant="warning">Partial</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Job Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor cron job execution history
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === ""
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("scrape-security")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === "scrape-security"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Security Scans
          </button>
          <button
            onClick={() => setFilter("scrape-inventory")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === "scrape-inventory"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Inventory Scans
          </button>
        </div>
      </Card>

      {/* Logs */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            No job logs yet. Jobs will appear here after cron runs.
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.jobType === "scrape-security" ? "Security Scan" : "Inventory Scan"}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {log.duration}ms
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Checked:</span>{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.itemsChecked}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Found:</span>{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.itemsFound}
                    </span>
                  </div>
                  {log.errors.length > 0 && (
                    <div>
                      <span className="text-gray-500">Errors:</span>{" "}
                      <span className="font-medium text-red-600">
                        {log.errors.length}
                      </span>
                    </div>
                  )}
                </div>

                {log.errors.length > 0 && (
                  <div className="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Errors:
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-red-700 dark:text-red-400">
                      {log.errors.slice(0, 5).map((err, i) => (
                        <li key={i} className="truncate">
                          {err}
                        </li>
                      ))}
                      {log.errors.length > 5 && (
                        <li>... and {log.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
