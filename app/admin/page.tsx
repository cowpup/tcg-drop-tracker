"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, Badge, LoadingSpinner } from "@/components/ui";
import {
  Package,
  Calendar,
  MapPin,
  Radio,
  RefreshCw,
  Plus,
  Database,
  Zap,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";

// Admin user IDs - in production, use a proper role system
const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface Stats {
  products: number;
  drops: number;
  shows: number;
  signals: number;
}

interface Product {
  id: string;
  name: string;
  game: string;
  type: string;
  msrp: number | null;
}

interface Drop {
  id: string;
  retailer: string;
  dropType: string;
  status: string;
  scheduledAt: string | null;
  product: { name: string };
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth();
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ products: 0, drops: 0, shows: 0, signals: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, dropsRes, showsRes, signalsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/drops"),
          fetch("/api/shows"),
          fetch("/api/signals"),
        ]);
        const [productsData, dropsData, shows, signals] = await Promise.all([
          productsRes.json(),
          dropsRes.json(),
          showsRes.json(),
          signalsRes.json(),
        ]);
        setStats({
          products: productsData?.pagination?.total ?? 0,
          drops: dropsData?.pagination?.total ?? 0,
          shows: shows?.pagination?.total ?? 0,
          signals: Array.isArray(signals) ? signals.length : 0,
        });
        setProducts(productsData?.data ?? []);
        setDrops(dropsData?.data ?? []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This will also delete associated drops.")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setStats((s) => ({ ...s, products: s.products - 1 }));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const deleteDrop = async (id: string) => {
    if (!confirm("Delete this drop?")) return;
    try {
      const res = await fetch(`/api/drops/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDrops(drops.filter((d) => d.id !== id));
        setStats((s) => ({ ...s, drops: s.drops - 1 }));
      }
    } catch (err) {
      console.error("Failed to delete drop:", err);
    }
  };

  const runGeocode = async () => {
    setGeocoding(true);
    setGeocodeResult(null);

    try {
      const res = await fetch("/api/shows/geocode?limit=20", { method: "POST" });
      const data = await res.json();
      setGeocodeResult(
        `Processed ${data.processed} shows: ${data.geocoded} geocoded, ${data.failed} failed`
      );
    } catch (error) {
      setGeocodeResult(`Error: ${error}`);
    } finally {
      setGeocoding(false);
    }
  };

  if (!isLoaded) {
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
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage drops, shows, and system operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.products}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drops</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.drops}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Shows</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.shows}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <Radio className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Signals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.signals}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/products">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link href="/admin/drops">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4" />
              Add Drop
            </Button>
          </Link>
          <Link href="/admin/shows">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4" />
              Manage Shows
            </Button>
          </Link>
          <Link href="/admin/monitors">
            <Button variant="outline" className="w-full justify-start">
              <Radio className="h-4 w-4" />
              Manage Monitors
            </Button>
          </Link>
          <Link href="/admin/jobs">
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4" />
              Job Logs
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
        </div>
      </Card>

      {/* System Operations */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          System Operations
        </h2>
        <div className="space-y-4">
          {/* Geocoding */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Geocode Trade Shows
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Convert addresses to coordinates for map display
              </p>
              {geocodeResult && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  {geocodeResult}
                </p>
              )}
            </div>
            <Button
              onClick={runGeocode}
              loading={geocoding}
              variant="outline"
            >
              <MapPin className="h-4 w-4" />
              Run Geocoding
            </Button>
          </div>

          {/* Manual Cron Trigger */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Trigger Security Scan
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manually run security monitoring cron job
              </p>
            </div>
            <Button variant="outline" disabled>
              <Zap className="h-4 w-4" />
              Run Scan
            </Button>
          </div>
        </div>
      </Card>

      {/* Products List */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Products
          </h2>
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left font-medium text-gray-500">ID</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Name</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Game</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                  <th className="pb-2 text-right font-medium text-gray-500">MSRP</th>
                  <th className="pb-2 text-right font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-mono text-xs text-gray-500">{product.id}</td>
                    <td className="py-2 text-gray-900 dark:text-white">{product.name}</td>
                    <td className="py-2">
                      <Badge variant="default">{product.game}</Badge>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{product.type}</td>
                    <td className="py-2 text-right text-gray-900 dark:text-white">
                      {product.msrp ? `$${product.msrp.toFixed(2)}` : "-"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drops List */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Drops
          </h2>
          <Link href="/admin/drops">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </Link>
        </div>
        {drops.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No drops yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left font-medium text-gray-500">Product</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Retailer</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Status</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Scheduled</th>
                  <th className="pb-2 text-right font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {drops.map((drop) => (
                  <tr key={drop.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-900 dark:text-white">{drop.product.name}</td>
                    <td className="py-2">
                      <Badge variant="default">{drop.retailer}</Badge>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{drop.dropType}</td>
                    <td className="py-2">
                      <Badge variant={drop.status === "LIVE" ? "success" : "default"}>
                        {drop.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {drop.scheduledAt ? new Date(drop.scheduledAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => deleteDrop(drop.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
