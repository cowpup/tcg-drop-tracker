"use client";

import { useState, useEffect, useCallback } from "react";
import type { Drop, Product, SignalType } from "@/types";

interface DropWithProduct extends Drop {
  product: Product;
  signals: Array<{
    id: string;
    type: SignalType;
    detectedAt: Date;
  }>;
}

interface UseDropsOptions {
  game?: string;
  retailer?: string;
  dropType?: string;
  status?: string;
  upcoming?: boolean;
  past?: boolean;
  page?: number;
  limit?: number;
}

interface UseDropsResult {
  drops: DropWithProduct[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
}

export function useDrops(options: UseDropsOptions = {}): UseDropsResult {
  const [drops, setDrops] = useState<DropWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchDrops = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.game) params.set("game", options.game);
      if (options.retailer) params.set("retailer", options.retailer);
      if (options.dropType) params.set("dropType", options.dropType);
      if (options.status) params.set("status", options.status);
      if (options.upcoming) params.set("upcoming", "true");
      if (options.past) params.set("past", "true");
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));

      const response = await fetch(`/api/drops?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch drops");
      }

      setDrops(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [
    options.game,
    options.retailer,
    options.dropType,
    options.status,
    options.upcoming,
    options.past,
    options.page,
    options.limit,
  ]);

  useEffect(() => {
    fetchDrops();
  }, [fetchDrops]);

  return {
    drops,
    loading,
    error,
    pagination,
    refetch: fetchDrops,
  };
}
