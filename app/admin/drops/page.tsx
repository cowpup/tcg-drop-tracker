"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, LoadingSpinner } from "@/components/ui";
import { Retailer, DropType, RetailerLabels, DropTypeLabels } from "@/types";
import { ArrowLeft, Save, Check } from "lucide-react";
import Link from "next/link";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

export default function AddDropPage() {
  const { userId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productId: "",
    retailer: "" as Retailer | "",
    dropType: "" as DropType | "",
    scheduledAt: "",
    price: "",
    url: "",
    notes: "",
  });

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSaved(true);
      setFormData({
        productId: "",
        retailer: "",
        dropType: "",
        scheduledAt: "",
        price: "",
        url: "",
        notes: "",
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create drop");
    } finally {
      setSaving(false);
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
            Add Drop
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new product drop event
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product ID *
            </label>
            <input
              type="text"
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              placeholder="Product CUID"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select retailer...</option>
                {Object.values(Retailer).map((r) => (
                  <option key={r} value={r}>
                    {RetailerLabels[r] || r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop Type *
              </label>
              <select
                required
                value={formData.dropType}
                onChange={(e) => setFormData({ ...formData, dropType: e.target.value as DropType })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type...</option>
                {Object.values(DropType).map((t) => (
                  <option key={t} value={t}>
                    {DropTypeLabels[t] || t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Scheduled Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="49.99"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Drop
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
