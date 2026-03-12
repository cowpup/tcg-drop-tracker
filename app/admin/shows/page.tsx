"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, Badge, LoadingSpinner, Modal } from "@/components/ui";
import { ShowType, ShowTier, ShowTypeLabels, ShowTierLabels } from "@/types";
import {
  ArrowLeft,
  Save,
  Check,
  Download,
  RefreshCw,
  Trash2,
  Edit2,
  Plus,
  MapPin,
  Calendar,
  ExternalLink,
  Radar,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

type ShowSource = "MANUAL" | "SEED" | "SPORTS_COLLECTORS_DIGEST" | "TRADING_CARD_CON" | "COLLECT_A_CON" | "RK9" | "OTHER";

const ShowSourceLabels: Record<ShowSource, string> = {
  MANUAL: "Manual",
  SEED: "Seed Data",
  SPORTS_COLLECTORS_DIGEST: "Sports Collectors Digest",
  TRADING_CARD_CON: "Trading Card Con",
  COLLECT_A_CON: "Collect-A-Con",
  RK9: "RK9",
  OTHER: "Other",
};

interface TradeShow {
  id: string;
  name: string;
  organizer: string | null;
  showType: ShowType;
  tier: ShowTier;
  startDate: string;
  endDate: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  website: string | null;
  ticketUrl: string | null;
  description: string | null;
  featured: boolean;
  lat: number | null;
  lng: number | null;
  source: ShowSource;
  verified: boolean;
}

const emptyForm = {
  name: "",
  organizer: "",
  showType: "" as ShowType | "",
  tier: "" as ShowTier | "",
  startDate: "",
  endDate: "",
  venueName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  website: "",
  ticketUrl: "",
  description: "",
  featured: false,
};

export default function ManageShowsPage() {
  const { userId } = useAuth();
  const [shows, setShows] = useState<TradeShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    created: number;
    skipped: number;
    total: number;
  } | null>(null);

  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{
    showsFound: number;
    showsCreated: number;
    showsSkipped: number;
  } | null>(null);

  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | "shows" | "tournaments">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<TradeShow | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await fetch("/api/shows?limit=100");
      const data = await res.json();
      setShows(data.data || []);
    } catch (err) {
      console.error("Failed to fetch shows:", err);
    } finally {
      setLoading(false);
    }
  };

  const bulkSeedShows = async () => {
    if (!confirm("Import 25+ verified trade shows?")) return;

    setSeeding(true);
    setSeedResult(null);
    setError(null);

    try {
      const res = await fetch("/api/shows/seed", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Seed failed");

      setSeedResult({
        created: data.created,
        skipped: data.skipped,
        total: data.total,
      });
      fetchShows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const scrapeShows = async () => {
    setScraping(true);
    setScrapeResult(null);
    setError(null);

    try {
      const res = await fetch("/api/cron/scrape-shows", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Scrape failed");

      setScrapeResult({
        showsFound: data.showsFound,
        showsCreated: data.showsCreated,
        showsSkipped: data.showsSkipped,
      });
      fetchShows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setScraping(false);
    }
  };

  const verifyShow = async (id: string) => {
    try {
      const res = await fetch(`/api/shows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setShows(shows.map((s) => (s.id === id ? { ...s, verified: true } : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify show");
    }
  };

  const TOURNAMENT_TYPES: ShowType[] = ["REGIONAL_CHAMPIONSHIP", "NATIONALS"];
  const SHOW_TYPES: ShowType[] = ["CARD_SHOW", "COLLECTACON", "COMIC_CON", "GAME_STORE_EVENT", "OTHER"];

  const filteredShows = shows.filter((show) => {
    // Verified filter
    if (filterVerified === "verified" && !show.verified) return false;
    if (filterVerified === "unverified" && show.verified) return false;

    // Category filter
    if (filterCategory === "shows" && !SHOW_TYPES.includes(show.showType)) return false;
    if (filterCategory === "tournaments" && !TOURNAMENT_TYPES.includes(show.showType)) return false;

    return true;
  });

  const openCreateModal = () => {
    setEditingShow(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (show: TradeShow) => {
    setEditingShow(show);
    setFormData({
      name: show.name,
      organizer: show.organizer || "",
      showType: show.showType,
      tier: show.tier,
      startDate: show.startDate.split("T")[0],
      endDate: show.endDate.split("T")[0],
      venueName: show.venueName,
      address: show.address,
      city: show.city,
      state: show.state,
      zip: show.zip || "",
      website: show.website || "",
      ticketUrl: show.ticketUrl || "",
      description: show.description || "",
      featured: show.featured,
    });
    setModalOpen(true);
  };

  const saveShow = async () => {
    setSaving(true);
    setError(null);

    try {
      const url = editingShow ? `/api/shows/${editingShow.id}` : "/api/shows";
      const method = editingShow ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await fetchShows();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save show");
    } finally {
      setSaving(false);
    }
  };

  const deleteShow = async (id: string) => {
    if (!confirm("Delete this trade show?")) return;

    try {
      const res = await fetch(`/api/shows/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setShows(shows.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete show");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trade Shows
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage trade shows and events
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Add Show
        </Button>
      </div>

      {/* Scrape & Import Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Auto-Scrape Shows
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Fetch from Sports Collectors Digest, Trading Card Con
              </p>
              {scrapeResult && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Found {scrapeResult.showsFound}, created {scrapeResult.showsCreated}, skipped {scrapeResult.showsSkipped}
                </p>
              )}
            </div>
            <Button variant="primary" onClick={scrapeShows} loading={scraping}>
              <Radar className="h-4 w-4" />
              Scrape Now
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Seed Data
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Import pre-verified shows from seed data
              </p>
              {seedResult && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Created {seedResult.created}, skipped {seedResult.skipped}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={bulkSeedShows} loading={seeding}>
              <Download className="h-4 w-4" />
              Import
            </Button>
          </div>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Shows List */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Shows ({filteredShows.length} of {shows.length})
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as "all" | "shows" | "tournaments")}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="shows">Card Shows & Cons</option>
              <option value="tournaments">Tournaments</option>
            </select>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as "all" | "verified" | "unverified")}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="unverified">Needs Review</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : shows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No shows yet. Add one or use bulk import.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500">Show</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Location</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Dates</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Source</th>
                  <th className="pb-3 text-center font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShows.map((show) => (
                  <tr key={show.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {show.name}
                        </span>
                        {show.featured && (
                          <Badge variant="primary" size="sm">Featured</Badge>
                        )}
                      </div>
                      {show.website && (
                        <a
                          href={show.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {show.city}, {show.state}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {format(new Date(show.startDate), "MMM d")} - {format(new Date(show.endDate), "MMM d, yyyy")}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant="info" size="sm">
                          {ShowSourceLabels[show.source] || show.source}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {ShowTypeLabels[show.showType] || show.showType}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {show.verified ? (
                          <span title="Verified">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </span>
                        ) : (
                          <span title="Needs review">
                            <Clock className="h-4 w-4 text-amber-500" />
                          </span>
                        )}
                        {show.lat && show.lng ? (
                          <span title="Geocoded">
                            <MapPin className="h-3 w-3 text-blue-400" />
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        {!show.verified && (
                          <button
                            onClick={() => verifyShow(show.id)}
                            className="rounded p-1.5 text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/20"
                            title="Verify show"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(show)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteShow(show.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingShow ? "Edit Trade Show" : "Add Trade Show"}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Collect-a-Con Dallas"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organizer
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Type *
              </label>
              <select
                required
                value={formData.showType}
                onChange={(e) => setFormData({ ...formData, showType: e.target.value as ShowType })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type...</option>
                {Object.values(ShowType).map((t) => (
                  <option key={t} value={t}>{ShowTypeLabels[t] || t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tier *
              </label>
              <select
                required
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as ShowTier })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select tier...</option>
                {Object.values(ShowTier).map((t) => (
                  <option key={t} value={t}>{ShowTierLabels[t] || t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State *
              </label>
              <select
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ZIP
              </label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ticket URL
              </label>
              <input
                type="url"
                value={formData.ticketUrl}
                onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
              Featured event
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveShow} loading={saving}>
              {editingShow ? "Save Changes" : "Create Show"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
