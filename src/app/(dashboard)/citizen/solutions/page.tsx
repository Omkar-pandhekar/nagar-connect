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
  MapPin,
  Eye,
  ChevronRight,
  FileText,
  User,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TimelineEntry {
  status: string;
  timestamp: string | Date;
  by?:
    | {
        _id: string;
        fullName?: string;
        email?: string;
      }
    | string;
  notes?: string;
}

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  address: string;
  media: Array<{
    url: string;
    type: string;
    thumbnailUrl?: string;
  }>;
  assignedTo?: {
    department?:
      | {
          name: string;
          shortCode: string;
        }
      | string;
    staffId?:
      | {
          fullName: string;
          email: string;
        }
      | string;
  };
  timeline: TimelineEntry[];
  resolutionDetails?: {
    resolutionSummary?: string;
    resolutionMedia?: Array<{
      url: string;
      type: string;
      thumbnailUrl?: string;
    }>;
    resolvedDate?: string | Date;
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

export default function SolutionsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, selectedStatus]);

  async function fetchIssues() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const res = await fetch(`/api/issues/get-issue?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setIssues(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to load issues");
      }
    } catch (error) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (issueId: string) => {
    setExpandedIssues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

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
      case "acknowledged":
        return "bg-indigo-100 text-indigo-700";
      case "reported":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "reopened":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return CheckCircle;
      case "in_progress":
        return Clock;
      case "assigned":
        return User;
      default:
        return AlertCircle;
    }
  };

  const formatTimelineDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-600" />
          My Solutions
        </h1>
        <p className="text-gray-500">
          Track the status and timeline of your reported issues
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {loading ? (
        <div className="w-full h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : issues.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No issues found</p>
            <p className="text-sm text-gray-500 mt-2">
              {selectedStatus !== "all"
                ? "Try selecting a different status filter"
                : "You haven't reported any issues yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => {
            const StatusIcon = getStatusIcon(issue.status);
            const isExpanded = expandedIssues.has(issue._id);
            const sortedTimeline = [...(issue.timeline || [])].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            return (
              <Card key={issue._id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Issue Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Badge className={getStatusColor(issue.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {issue.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{issue.category}</Badge>
                          {issue.statusReview?.reviewStatus === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
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
                          {issue.assignedTo?.staffId && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>
                                {typeof issue.assignedTo.staffId === "object"
                                  ? issue.assignedTo.staffId.fullName
                                  : "Worker"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(issue._id)}
                      >
                        {isExpanded ? "Hide" : "Show"} Timeline
                        <ChevronRight
                          className={`w-4 h-4 ml-2 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Resolution Details */}
                    {issue.status === "resolved" && issue.resolutionDetails && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">
                              Issue Resolved
                            </p>
                            {issue.resolutionDetails.resolutionSummary && (
                              <p className="text-sm text-green-700 mt-1">
                                {issue.resolutionDetails.resolutionSummary}
                              </p>
                            )}
                            {issue.resolutionDetails.resolvedDate && (
                              <p className="text-xs text-green-600 mt-1">
                                Resolved on:{" "}
                                {formatTimelineDate(
                                  issue.resolutionDetails.resolvedDate
                                )}
                              </p>
                            )}
                            {issue.resolutionDetails.resolutionMedia &&
                              issue.resolutionDetails.resolutionMedia.length >
                                0 && (
                                <div className="mt-2 flex gap-2">
                                  {issue.resolutionDetails.resolutionMedia.map(
                                    (media, i) => (
                                      <img
                                        key={i}
                                        src={media.url}
                                        alt={`Resolution ${i + 1}`}
                                        className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                        onClick={() =>
                                          window.open(media.url, "_blank")
                                        }
                                      />
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {isExpanded && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Timeline
                        </h4>
                        {sortedTimeline.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No timeline entries yet
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {sortedTimeline.map((entry, index) => {
                              const EntryIcon = getStatusIcon(entry.status);
                              return (
                                <div
                                  key={index}
                                  className="flex gap-3 pb-3 border-b last:border-0"
                                >
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <EntryIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={getStatusColor(entry.status)}
                                      >
                                        {entry.status
                                          .replace("_", " ")
                                          .toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        {formatTimelineDate(entry.timestamp)}
                                      </span>
                                    </div>
                                    {entry.notes && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {entry.notes}
                                      </p>
                                    )}
                                    {entry.by && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        by:{" "}
                                        {typeof entry.by === "object"
                                          ? entry.by.fullName || entry.by.email
                                          : "System"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
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
