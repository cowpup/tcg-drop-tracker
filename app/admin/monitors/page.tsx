"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, Badge, LoadingSpinner } from "@/components/ui";
import { Retailer, RetailerLabels } from "@/types";
import { ArrowLeft, Save, Check, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface Monitor {
  id: string;
  url: string;
  retailer: string;
  name: string | null;
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
    name: "",
  });

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
      setFormData({ url: "", retailer: "", productId: "", name: "" });
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

          <div className="grid gap-4 sm:grid-cols-3">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Label (optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pokemon Center ETB"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
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
                    {monitor.name && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {monitor.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                    {monitor.url}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    {monitor.product && (
                      <span>Product: {monitor.product.name}</span>
                    )}
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
