"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, Button, Badge, LoadingSpinner } from "@/components/ui";
import { ArrowLeft, Search, Shield, Crown, Users, CreditCard, Save, X } from "lucide-react";
import Link from "next/link";

const SUPER_ADMIN_ID = "user_3AXkPvNHZ8Jc09Csj9IWHKipRF9";

interface User {
  id: string;
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  role: string;
  subscriptionTier: string;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  _count: {
    webhooks: number;
  };
}

const ROLE_LABELS: Record<string, string> = {
  USER: "User",
  SUBSCRIBER: "Subscriber",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

const ROLE_COLORS: Record<string, string> = {
  USER: "default",
  SUBSCRIBER: "success",
  ADMIN: "warning",
  SUPER_ADMIN: "danger",
};

const TIER_LABELS: Record<string, string> = {
  FREE: "Free",
  SUBSCRIBER: "Subscriber",
  PREMIUM: "Premium",
};

export default function UsersPage() {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = userId === SUPER_ADMIN_ID;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setUsers(users.map((u) => (u.id === id ? data.data : u)));
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.displayName?.toLowerCase().includes(query) ||
      user.clerkUserId.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length,
    subscribers: users.filter((u) => u.subscriptionTier !== "FREE").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
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
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage user roles and subscriptions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.admins}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.subscribers}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
            No users found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-medium text-gray-500">User</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Role</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Subscription</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Webhooks</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Joined</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.displayName || "No name"}
                          </span>
                          {user.clerkUserId === SUPER_ADMIN_ID && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {user.email || user.clerkUserId}
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, role: e.target.value })
                          }
                          disabled={!isSuperAdmin && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")}
                          className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                        >
                          <option value="USER">User</option>
                          <option value="SUBSCRIBER">Subscriber</option>
                          {isSuperAdmin && <option value="ADMIN">Admin</option>}
                          {isSuperAdmin && user.clerkUserId === SUPER_ADMIN_ID && (
                            <option value="SUPER_ADMIN">Super Admin</option>
                          )}
                        </select>
                      ) : (
                        <Badge variant={ROLE_COLORS[user.role] as any} size="sm">
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.subscriptionTier}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, subscriptionTier: e.target.value })
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                        >
                          <option value="FREE">Free</option>
                          <option value="SUBSCRIBER">Subscriber</option>
                          <option value="PREMIUM">Premium</option>
                        </select>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">
                          {TIER_LABELS[user.subscriptionTier] || user.subscriptionTier}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {user._count.webhooks}
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {editingUser?.id === user.id ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={saving}
                            onClick={() =>
                              updateUser(user.id, {
                                role: editingUser.role,
                                subscriptionTier: editingUser.subscriptionTier,
                              })
                            }
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          disabled={user.clerkUserId === SUPER_ADMIN_ID && !isSuperAdmin}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Help Text */}
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Role Permissions
        </h3>
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p><strong>User:</strong> Basic access, can view drops and shows</p>
          <p><strong>Subscriber:</strong> Can create Discord webhooks and receive email notifications</p>
          <p><strong>Admin:</strong> Can manage products, drops, shows, and monitors</p>
          <p><strong>Super Admin:</strong> Can manage everything including admin roles</p>
        </div>
      </Card>
    </div>
  );
}
