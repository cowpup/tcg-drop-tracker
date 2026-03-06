"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, Badge, LoadingSpinner, Modal } from "@/components/ui";
import { MultiSelectFilter } from "@/components/ui/FilterBar";
import {
  Game,
  Retailer,
  SignalType,
  GameLabels,
  RetailerLabels,
  SignalTypeLabels,
} from "@/types";
import {
  Webhook,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

interface DiscordWebhook {
  id: string;
  label: string;
  webhookUrl: string;
  games: Game[];
  retailers: Retailer[];
  signalTypes: SignalType[];
  active: boolean;
  createdAt: string;
}

const gameOptions = Object.values(Game).map((g) => ({
  value: g,
  label: GameLabels[g] || g,
}));

const retailerOptions = Object.values(Retailer).map((r) => ({
  value: r,
  label: RetailerLabels[r] || r,
}));

const signalTypeOptions = Object.values(SignalType).map((t) => ({
  value: t,
  label: SignalTypeLabels[t] || t,
}));

interface UserProfile {
  canCreateWebhooks: boolean;
  subscriptionTier: string;
  role: string;
}

export default function WebhooksPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [webhooks, setWebhooks] = useState<DiscordWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<DiscordWebhook | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    webhookUrl: "",
    games: [] as string[],
    retailers: [] as string[],
    signalTypes: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data.data);
      }
    } catch {
      console.error("Failed to fetch user profile");
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks/discord");
      const data = await res.json();
      if (res.ok) {
        setWebhooks(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchWebhooks();
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, fetchWebhooks, fetchUserProfile]);

  const openCreateModal = () => {
    setEditingWebhook(null);
    setFormData({
      label: "",
      webhookUrl: "",
      games: [],
      retailers: [],
      signalTypes: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (webhook: DiscordWebhook) => {
    setEditingWebhook(webhook);
    setFormData({
      label: webhook.label,
      webhookUrl: webhook.webhookUrl,
      games: webhook.games,
      retailers: webhook.retailers,
      signalTypes: webhook.signalTypes,
    });
    setModalOpen(true);
  };

  const saveWebhook = async () => {
    setSaving(true);
    setError(null);

    try {
      const url = editingWebhook
        ? `/api/webhooks/discord/${editingWebhook.id}`
        : "/api/webhooks/discord";
      const method = editingWebhook ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchWebhooks();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save webhook");
    } finally {
      setSaving(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const res = await fetch(`/api/webhooks/discord/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete webhook");
    }
  };

  const toggleActive = async (webhook: DiscordWebhook) => {
    try {
      const res = await fetch(`/api/webhooks/discord/${webhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !webhook.active }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === webhook.id ? { ...w, active: !w.active } : w
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update webhook");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Webhook className="h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Server Alerts
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-center max-w-md">
          Sign in to set up drop alerts for your Discord server or community
        </p>
      </div>
    );
  }

  // Free tier users see subscriber benefits instead of webhook management
  if (userProfile && !userProfile.canCreateWebhooks) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Server Alerts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Set up drop alerts for your Discord server or community
          </p>
        </div>

        <Card>
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Webhook className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Alert Your Community
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Run a Discord server? Subscribers can connect their server to receive automatic drop alerts. Keep your community informed the moment restocks and new releases go live.
            </p>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Automatic Posts</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Alerts post to your channel automatically - no manual updates needed
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Filter by Game</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Only receive alerts for Pokemon, MTG, sports cards, or specific retailers
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Multiple Channels</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Set up different alerts for different channels or servers
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your current plan: <span className="font-medium text-gray-900 dark:text-white">{userProfile.subscriptionTier}</span>
              </p>
            </div>
            <Badge variant="primary">Coming Soon</Badge>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Server Alerts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Send drop alerts to your Discord server
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Add Server
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Webhook className="h-10 w-10 text-gray-400" />
            <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
              No servers connected
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Connect your Discord server to automatically post drop alerts to your community
            </p>
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="h-4 w-4" />
              Connect Your Server
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {webhook.label}
                    </h3>
                    <Badge
                      variant={webhook.active ? "success" : "default"}
                      size="sm"
                    >
                      {webhook.active ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {webhook.games.length > 0 ? (
                      webhook.games.slice(0, 3).map((g) => (
                        <Badge key={g} variant="primary" size="sm">
                          {GameLabels[g] || g}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="default" size="sm">All Games</Badge>
                    )}
                    {webhook.games.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{webhook.games.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(webhook)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                    title={webhook.active ? "Pause" : "Activate"}
                  >
                    {webhook.active ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(webhook)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="rounded-md p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWebhook ? "Edit Webhook" : "Add Webhook"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData((f) => ({ ...f, label: e.target.value }))
              }
              placeholder="My Server Alerts"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Webhook URL
            </label>
            <input
              type="url"
              value={formData.webhookUrl}
              onChange={(e) =>
                setFormData((f) => ({ ...f, webhookUrl: e.target.value }))
              }
              placeholder="https://discord.com/api/webhooks/..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <a
              href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              How to create a Discord webhook
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Games (leave empty for all)
            </label>
            <MultiSelectFilter
              label=""
              values={formData.games}
              options={gameOptions}
              onChange={(values) =>
                setFormData((f) => ({ ...f, games: values }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retailers (leave empty for all)
            </label>
            <MultiSelectFilter
              label=""
              values={formData.retailers}
              options={retailerOptions}
              onChange={(values) =>
                setFormData((f) => ({ ...f, retailers: values }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alert Types (leave empty for all)
            </label>
            <MultiSelectFilter
              label=""
              values={formData.signalTypes}
              options={signalTypeOptions}
              onChange={(values) =>
                setFormData((f) => ({ ...f, signalTypes: values }))
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveWebhook} loading={saving}>
              {editingWebhook ? "Save Changes" : "Add Webhook"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
