"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Briefcase,
  MapPin,
  User,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface OverviewData {
  department: {
    _id: string;
    name: string;
    shortCode: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  stats: {
    total: number;
    unassigned: number;
    pendingReview: number;
    resolved: number;
    inProgress: number;
    assigned: number;
    reported: number;
  };
  workers: {
    total: number;
    approved: number;
    pending: number;
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
      const res = await fetch("/api/departments/overview");
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
      case "reported":
        return "bg-blue-100 text-blue-700";
      case "acknowledged":
        return "bg-indigo-100 text-indigo-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "reopened":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Department Overview</h1>
        <p className="text-gray-500">
          {data.department.name} ({data.department.shortCode})
        </p>
      </div>

      {/* Main Stats Cards */}
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
              <AlertCircle className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">
                  {data.stats.unassigned}
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
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">
                  {data.stats.pendingReview}
                </p>
              </div>
              <FileText className="w-10 h-10 text-yellow-600" />
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

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold mt-2 text-yellow-600">
                  {data.stats.inProgress}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold mt-2 text-purple-600">
                  {data.stats.assigned}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reported</p>
                <p className="text-2xl font-bold mt-2 text-blue-600">
                  {data.stats.reported}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
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

      {/* Workers Stats */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Workers
          </CardTitle>
          <Link href="/department/workers">
            <Button variant="outline" size="sm">
              Manage Workers
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total Workers</p>
              <p className="text-2xl font-bold mt-2">{data.workers.total}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {data.workers.approved}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">
                {data.workers.pending}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Issues</CardTitle>
          <Link href="/department/issues">
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
                  href={`/department/issues/${issue._id}`}
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
                        {issue.assignedTo?.staffId && (
                          <span className="text-xs text-gray-500">
                            • Assigned to{" "}
                            {typeof issue.assignedTo.staffId === "object"
                              ? issue.assignedTo.staffId.fullName
                              : "Worker"}
                          </span>
                        )}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Department Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Department Name</p>
              <p className="font-medium">{data.department.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Short Code</p>
              <p className="font-medium">{data.department.shortCode}</p>
            </div>
            {data.department.contactEmail && (
              <div>
                <p className="text-sm text-gray-600">Contact Email</p>
                <p className="font-medium">{data.department.contactEmail}</p>
              </div>
            )}
            {data.department.contactPhone && (
              <div>
                <p className="text-sm text-gray-600">Contact Phone</p>
                <p className="font-medium">{data.department.contactPhone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
