"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, LoadingSpinner, Badge } from "@/components/ui";
import { MultiSelectFilter } from "@/components/ui/FilterBar";
import {
  Game,
  Retailer,
  SignalType,
  GameLabels,
  RetailerLabels,
  SignalTypeLabels,
} from "@/types";
import { Bell, Mail, Save, AlertCircle, Check } from "lucide-react";
import Link from "next/link";

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

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState({
    games: [] as string[],
    retailers: [] as string[],
    signalTypes: [] as string[],
    emailEnabled: true,
  });

  useEffect(() => {
    // Load preferences from API
    const loadPreferences = async () => {
      try {
        // In a real app, we'd fetch from /api/preferences
        // For now, just simulate loading
        await new Promise((r) => setTimeout(r, 500));
        setLoading(false);
      } catch {
        setError("Failed to load preferences");
        setLoading(false);
      }
    };

    if (isSignedIn) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  const savePreferences = async () => {
    setSaving(true);
    setError(null);

    try {
      // In a real app, we'd POST to /api/preferences
      await new Promise((r) => setTimeout(r, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
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
        <Bell className="h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Sign in to manage notifications
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Create an account to set up personalized drop alerts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notification Preferences
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize which drops and signals you want to be notified about
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Notifications Toggle */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive drop alerts via email
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPreferences((p) => ({
                    ...p,
                    emailEnabled: !p.emailEnabled,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailEnabled
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Game Preferences */}
          <Card>
            <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
              Games to Track
            </h3>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Select which TCGs you want to receive notifications for
            </p>
            <MultiSelectFilter
              label=""
              values={preferences.games}
              options={gameOptions}
              onChange={(values) =>
                setPreferences((p) => ({ ...p, games: values }))
              }
            />
          </Card>

          {/* Retailer Preferences */}
          <Card>
            <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
              Retailers to Track
            </h3>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Select which retailers you want to receive notifications from
            </p>
            <MultiSelectFilter
              label=""
              values={preferences.retailers}
              options={retailerOptions}
              onChange={(values) =>
                setPreferences((p) => ({ ...p, retailers: values }))
              }
            />
          </Card>

          {/* Signal Type Preferences */}
          <Card>
            <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
              Alert Types
            </h3>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Select which types of signals you want to be notified about
            </p>
            <MultiSelectFilter
              label=""
              values={preferences.signalTypes}
              options={signalTypeOptions}
              onChange={(values) =>
                setPreferences((p) => ({ ...p, signalTypes: values }))
              }
            />
          </Card>

          {/* Discord Alerts Link */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Discord Alerts
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get instant notifications in your Discord server
                </p>
              </div>
              <Link href="/webhooks">
                <Button variant="outline" size="sm">
                  Set Up Alerts
                </Button>
              </Link>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={savePreferences}
              loading={saving}
              disabled={saving}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
