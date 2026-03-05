"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, Badge, LoadingSpinner } from "@/components/ui";
import { Retailer, RetailerLabels } from "@/types";
import { ArrowLeft, Save, Check, Trash2, ExternalLink, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface Monitor {
  id: string;
  url: string;
  retailer: string;
  lastCheckedAt: string | null;
  lastStatus: number | null;
  product: { id: string; name: string } | null;
}

interface Product {
  id: string;
  name: string;
}

export default function MonitorsPage() {
  const { userId } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    url: "",
    retailer: "" as Retailer | "",
    productId: "",
  });

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    created: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [clearing, setClearing] = useState(false);

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  useEffect(() => {
    async function fetchData() {
      try {
        const [monitorsRes, productsRes] = await Promise.all([
          fetch("/api/monitors"),
          fetch("/api/products"),
        ]);
        const [monitorsData, productsData] = await Promise.all([
          monitorsRes.json(),
          productsRes.json(),
        ]);
        setMonitors(Array.isArray(monitorsData) ? monitorsData : []);
        setProducts(productsData?.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setMonitors([data, ...monitors]);
      setSaved(true);
      setFormData({ url: "", retailer: "", productId: "" });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create monitor");
    } finally {
      setSaving(false);
    }
  };

  const deleteMonitor = async (id: string) => {
    if (!confirm("Delete this monitor?")) return;

    try {
      const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMonitors(monitors.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const bulkSeedMonitors = async () => {
    if (!confirm("Bulk import 75+ retailer monitor URLs from Pokemon Center, Target, Walmart, GameStop, Best Buy, Amazon, and TCGPlayer?")) {
      return;
    }

    setSeeding(true);
    setSeedResult(null);

    try {
      const res = await fetch("/api/monitors/seed", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Seed failed");
      }

      setSeedResult({
        created: data.created,
        skipped: data.skipped,
        total: data.total,
      });

      // Refresh monitor list
      const monitorsRes = await fetch("/api/monitors");
      const monitorsData = await monitorsRes.json();
      setMonitors(Array.isArray(monitorsData) ? monitorsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const clearAllMonitors = async () => {
    if (!confirm("DELETE ALL MONITORS? This cannot be undone. You can re-import verified URLs after.")) {
      return;
    }

    setClearing(true);
    setError(null);

    try {
      const res = await fetch("/api/monitors", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Clear failed");
      }

      setMonitors([]);
      setSeedResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear monitors");
    } finally {
      setClearing(false);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            URL Monitors
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add retailer URLs to monitor for restocks and security changes
          </p>
        </div>
      </div>

      {/* Bulk Import */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bulk Import
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Import verified monitor URLs from major retailers (Pokemon Center, Target, Walmart, Amazon)
            </p>
            {seedResult && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Created {seedResult.created} monitors, skipped {seedResult.skipped} existing. Total: {seedResult.total}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearAllMonitors}
              loading={clearing}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              {clearing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={bulkSeedMonitors}
              loading={seeding}
            >
              {seeding ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Import Verified
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Monitor Form */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Add New Monitor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL to Monitor *
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://www.pokemoncenter.com/product/..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Retailer *
              </label>
              <select
                required
                value={formData.retailer}
                onChange={(e) => setFormData({ ...formData, retailer: e.target.value as Retailer })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select...</option>
                {Object.values(Retailer).map((r) => (
                  <option key={r} value={r}>
                    {RetailerLabels[r] || r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Link to Product
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button type="submit" loading={saving}>
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Add Monitor
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Monitors List */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Active Monitors ({monitors.length})
        </h2>
        {loading ? (
          <LoadingSpinner />
        ) : monitors.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No monitors configured. Add URLs above to start tracking.
          </p>
        ) : (
          <div className="space-y-3">
            {monitors.map((monitor) => (
              <div
                key={monitor.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{monitor.retailer}</Badge>
                    {monitor.product && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {monitor.product.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                    {monitor.url}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    {monitor.lastCheckedAt && (
                      <span>
                        Last checked: {new Date(monitor.lastCheckedAt).toLocaleString()}
                      </span>
                    )}
                    {monitor.lastStatus && (
                      <span>Status: {monitor.lastStatus}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={monitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => deleteMonitor(monitor.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
