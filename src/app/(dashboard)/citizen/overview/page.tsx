"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Tag, BarChart3, RefreshCw } from "lucide-react";

type Media = { url: string; type: "image" | "video" | "audio" };
type RecentIssue = {
  _id: string;
  title: string;
  status: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  address: string;
  media: Media[];
  createdAt: string;
};

type OverviewResponse = {
  success: boolean;
  overview: {
    totals: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    recent: RecentIssue[];
  };
};

const StatCard = ({ title, value, className = "" }: { title: string; value: number | string; className?: string }) => (
  <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

const Pill = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const OverviewPage = () => {
  const [data, setData] = useState<OverviewResponse["overview"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/issues/overview/me", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to load overview (${res.status})`);
      }
      const j: OverviewResponse = await res.json();
      setData(j.overview);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {loading && <div className="rounded-lg border bg-white p-6 text-center text-gray-600">Loading overview...</div>}
        {error && <div className="rounded-lg border bg-red-50 p-4 text-red-700">Error: {error}</div>}

        {data && (
          <div className="space-y-8">
            {/* Top stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Issues" value={data.totals.all || 0} />
              <StatCard title="Reported" value={data.totals.reported || 0} />
              <StatCard title="In Progress" value={data.totals.in_progress || 0} />
              <StatCard title="Resolved" value={data.totals.resolved || 0} />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800">By Category</h2>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(data.byCategory).length === 0 && (
                    <p className="text-sm text-gray-500">No data</p>
                  )}
                  {Object.entries(data.byCategory).map(([k, v]) => (
                    <Pill key={k} label={k} value={v} />
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800">By Priority</h2>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(data.byPriority).length === 0 && (
                    <p className="text-sm text-gray-500">No data</p>
                  )}
                  {Object.entries(data.byPriority).map(([k, v]) => (
                    <Pill key={k} label={k} value={v} />
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800">Key Status</h2>
                <div className="grid grid-cols-1 gap-2">
                  <Pill label="Acknowledged" value={data.totals.acknowledged || 0} />
                  <Pill label="Assigned" value={data.totals.assigned || 0} />
                  <Pill label="Rejected" value={data.totals.rejected || 0} />
                  <Pill label="Reopened" value={data.totals.reopened || 0} />
                </div>
              </div>
            </div>

            {/* Recent issues */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-800">Recent Issues</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.recent.length === 0 && (
                  <div className="col-span-full rounded-lg border bg-white p-6 text-center text-gray-500">
                    No recent issues
                  </div>
                )}
                {data.recent.map((item) => (
                  <div key={item._id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="h-40 w-full bg-gray-100">
                      {item.media && item.media[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.media[0].url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="line-clamp-1 font-medium text-gray-900">{item.title}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {item.category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.address}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;