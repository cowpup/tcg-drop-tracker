"use client";

import { useState, useEffect, useCallback } from "react";
import type { TradeShow } from "@/types";

interface UseShowsOptions {
  state?: string;
  showType?: string;
  tier?: string;
  upcoming?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface UseShowsResult {
  shows: TradeShow[];
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

export function useShows(options: UseShowsOptions = {}): UseShowsResult {
  const [shows, setShows] = useState<TradeShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchShows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.state) params.set("state", options.state);
      if (options.showType) params.set("showType", options.showType);
      if (options.tier) params.set("tier", options.tier);
      if (options.upcoming) params.set("upcoming", "true");
      if (options.featured !== undefined) params.set("featured", String(options.featured));
      if (options.startDate) params.set("startDate", options.startDate);
      if (options.endDate) params.set("endDate", options.endDate);
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));

      const response = await fetch(`/api/shows?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shows");
      }

      setShows(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [
    options.state,
    options.showType,
    options.tier,
    options.upcoming,
    options.featured,
    options.startDate,
    options.endDate,
    options.page,
    options.limit,
  ]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  return {
    shows,
    loading,
    error,
    pagination,
    refetch: fetchShows,
  };
}
