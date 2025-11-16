"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Briefcase,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OverviewData {
  profile: any;
  stats: {
    total: number;
    inProgress: number;
    pendingReview: number;
    resolved: number;
    assigned: number;
    pendingWork: number;
  };
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  recentIssues: any[];
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    try {
      const res = await fetch("/api/field_staff/overview");
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load overview</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "assigned":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Work Overview</h1>
        <p className="text-gray-500">
          Welcome back, {data.profile?.userId?.fullName || "Worker"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Issues
                </p>
                <p className="text-3xl font-bold mt-2">{data.stats.total}</p>
              </div>
              <Briefcase className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Work
                </p>
                <p className="text-3xl font-bold mt-2 text-orange-600">
                  {data.stats.pendingWork}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">
                  {data.stats.inProgress}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold mt-2 text-green-600">
                  {data.stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge className={getStatusColor(status)}>
                  {status.replace("_", " ").toUpperCase()}
                </Badge>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <Badge className={getPriorityColor(priority)}>
                  {priority.toUpperCase()}
                </Badge>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{category}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Issues</CardTitle>
          <Link href="/staff/issues">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentIssues.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent issues
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentIssues.map((issue: any) => (
                <Link
                  key={issue._id}
                  href={`/staff/issues/${issue._id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {issue.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Info */}
      {data.profile?.department && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Department Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">
                  {typeof data.profile.department === "object"
                    ? data.profile.department.name
                    : "N/A"}
                </p>
              </div>
              {data.profile.role && (
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">{data.profile.role}</p>
                </div>
              )}
              {data.profile.employeeId && (
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{data.profile.employeeId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
