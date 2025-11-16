"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  MapPin,
  Eye,
  Filter,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  address: string;
  location: {
    coordinates: [number, number];
  };
  assignedTo?: {
    department?: {
      name: string;
      shortCode: string;
    };
  };
  statusReview?: {
    reviewStatus?: string;
    requestedStatus?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function WorkPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
  });
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPendingWork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, selectedPriority, selectedCategory]);

  async function fetchPendingWork() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedPriority !== "all") {
        params.append("priority", selectedPriority);
      }
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const res = await fetch(`/api/field_staff/pending-work?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setIssues(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to load pending work");
      }
    } catch (error) {
      toast.error("Failed to load pending work");
    } finally {
      setLoading(false);
    }
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
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "assigned":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return Clock;
      case "assigned":
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  // Filter issues by search query
  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(query) ||
      issue.description.toLowerCase().includes(query) ||
      issue.category.toLowerCase().includes(query) ||
      issue.address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-blue-600" />
          Pending Work
        </h1>
        <p className="text-gray-500">
          Issues assigned to you that need attention
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pending
                </p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-3xl font-bold mt-2 text-purple-600">
                  {stats.assigned}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">
                  {stats.inProgress}
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
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-3xl font-bold mt-2 text-red-600">
                  {stats.byPriority.critical}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title, description, category, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Pothole">Pothole</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Garbage">Garbage</option>
                <option value="Water Leak">Water Leak</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Drainage">Drainage</option>
                <option value="Encroachment">Encroachment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {loading ? (
        <div className="w-full h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No pending work found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "All assigned issues have been completed!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const StatusIcon = getStatusIcon(issue.status);
            const hasPendingReview =
              issue.statusReview?.reviewStatus === "pending" &&
              issue.statusReview?.requestedStatus === "resolved";

            return (
              <Card
                key={issue._id}
                className="hover:shadow-md transition cursor-pointer"
              >
                <Link href={`/staff/issues/${issue._id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {issue.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {issue.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(issue.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {issue.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{issue.category}</Badge>
                          {hasPendingReview && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">
                              {issue.address}
                            </span>
                          </div>
                          {issue.assignedTo?.department && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span>
                                {typeof issue.assignedTo.department === "object"
                                  ? issue.assignedTo.department.name
                                  : "Department"}
                              </span>
                            </div>
                          )}
                          <span>
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} issues
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
