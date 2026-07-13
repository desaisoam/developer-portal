"use client";

import {
  lifetimeBucketBounds,
  trendBucketLabels,
  trendBucketVariables,
  trendRangeLabel,
  type TrendPeriod,
  weekBucketBounds,
} from "@/lib/day-buckets";
import { useMemo, useState } from "react";
import type { TrendSparklineState } from "./TrendSparkline";

export type TrendWindow = {
  weeklyBounds: string[];
  allTimeBounds: string[];
  selectedBounds: string[];
  labels: string[];
  rangeLabel: string;
  weeklyVariables: Record<string, string>;
  allTimeVariables: Record<string, string>;
};

type TrendBucketVariables = ReturnType<typeof trendBucketVariables>;

/**
 * Shared trend-window derivation for the World ID landing/detail pages: both
 * windows are frozen at mount so polling and refetches reuse stable Apollo
 * cache keys, and the all-time window falls back to the weekly one until
 * `createdAt` is known.
 */
export const useTrendWindow = (opts: {
  createdAt?: string | null;
  timePeriod: TrendPeriod;
  // The variables fields are narrowed to the concrete d0..d7 shape so they can
  // be spread straight into the generated queries' exact variable types.
}): TrendWindow & {
  weeklyVariables: TrendBucketVariables;
  allTimeVariables: TrendBucketVariables;
} => {
  const { createdAt, timePeriod } = opts;

  const [now] = useState(() => new Date());
  const weeklyBounds = useMemo(() => weekBucketBounds(now), [now]);
  const allTimeBounds = useMemo(
    () =>
      createdAt ? lifetimeBucketBounds(new Date(createdAt), now) : weeklyBounds,
    [createdAt, now, weeklyBounds],
  );
  const selectedBounds =
    timePeriod === "all-time" ? allTimeBounds : weeklyBounds;
  const labels = useMemo(
    () => trendBucketLabels(selectedBounds, timePeriod),
    [selectedBounds, timePeriod],
  );
  const rangeLabel = useMemo(
    () => trendRangeLabel(timePeriod, createdAt ?? undefined),
    [createdAt, timePeriod],
  );
  const weeklyVariables = useMemo(
    () => trendBucketVariables(weeklyBounds),
    [weeklyBounds],
  );
  const allTimeVariables = useMemo(
    () => trendBucketVariables(allTimeBounds),
    [allTimeBounds],
  );

  return {
    weeklyBounds,
    allTimeBounds,
    selectedBounds,
    labels,
    rangeLabel,
    weeklyVariables,
    allTimeVariables,
  };
};

/** Shared three-branch mapping from query status to a sparkline state. */
export const buildTrendState = (opts: {
  loading: boolean;
  error: boolean;
  points: number[];
  labels: string[];
  onRetry: () => void;
}): TrendSparklineState => {
  if (opts.loading) {
    return { status: "loading" };
  }
  if (opts.error) {
    return { status: "error", onRetry: opts.onRetry };
  }
  return { status: "ready", points: opts.points, labels: opts.labels };
};
