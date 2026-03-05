"use client";

import { useState } from "react";
import { useAuth, Show } from "@clerk/nextjs";
import { Card, Button, LoadingSpinner } from "@/components/ui";
import { Game, ProductType, GameLabels } from "@/types";
import { ArrowLeft, Save, Check } from "lucide-react";
import Link from "next/link";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

export default function AddProductPage() {
  const { userId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    game: "" as Game | "",
    type: "" as ProductType | "",
    imageUrl: "",
    msrp: "",
  });

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSaved(true);
      setFormData({ name: "", game: "", type: "", imageUrl: "", msrp: "" });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
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
            Add Product
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new TCG product in the catalog
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Prismatic Evolutions Elite Trainer Box"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Game *
              </label>
              <select
                required
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value as Game })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select game...</option>
                {Object.values(Game).map((g) => (
                  <option key={g} value={g}>
                    {GameLabels[g] || g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type...</option>
                {Object.values(ProductType).map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                MSRP
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.msrp}
                onChange={(e) => setFormData({ ...formData, msrp: e.target.value })}
                placeholder="49.99"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
