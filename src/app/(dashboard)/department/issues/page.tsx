"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Heading from "@/components/common/Heading";
import IssueDetailDialog from "@/components/common/IssueDetailDialog";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  MapPin,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Reporter {
  _id: string;
  fullName?: string;
  fullname?: string;
  email: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Issue {
  _id: string;
  reporterId: Reporter;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  status: string;
  priority: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  media: Array<{
    url: string;
    type: string;
    thumbnailUrl?: string;
  }>;
  assignedTo?: {
    department: Department;
    staffId?: string;
    assignedDate?: string;
  };
  expectedResolutionDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const IssuesManagementPage = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Dialog state
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page, selectedStatus, selectedCategory, selectedPriority]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedPriority !== "all")
        params.append("priority", selectedPriority);

      const res = await fetch(`/api/departments/get-all-issues?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setIssues(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        } else {
          setPagination((prev) => ({
            ...prev,
            total: data.data?.length || 0,
            totalPages: Math.ceil((data.data?.length || 0) / prev.limit),
          }));
        }
      } else {
        toast.error(data.error || "Failed to fetch issues");
      }
    } catch (error) {
      toast.error("Failed to fetch issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
    setDialogOpen(true);
  };

  const handleIssueUpdate = () => {
    fetchIssues(); // Refresh the list after update
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      reported: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      acknowledged: {
        bg: "bg-indigo-100",
        text: "text-indigo-700",
        icon: Clock,
      },
      assigned: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: Clock,
      },
      in_progress: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
      reopened: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.reported;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: "bg-gray-100", text: "text-gray-700" },
      medium: { bg: "bg-blue-100", text: "text-blue-700" },
      high: { bg: "bg-orange-100", text: "text-orange-700" },
      critical: { bg: "bg-red-100", text: "text-red-700" },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.medium;

    return (
      <Badge
        variant="outline"
        className={`text-xs ${config.bg} ${config.text}`}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {category}
      </Badge>
    );
  };

  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(query) ||
      issue.description.toLowerCase().includes(query) ||
      issue.address.toLowerCase().includes(query) ||
      (issue.reporterId?.fullName || issue.reporterId?.fullname)
        ?.toLowerCase()
        .includes(query)
    );
  });

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSelectedStatus("all");
    setSelectedCategory("all");
    setSelectedPriority("all");
    setSearchQuery("");
  };

  if (loading && issues.length === 0) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Issues Management"
        subtitle="View and manage all reported civic issues"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Issues
                </p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reported</p>
                <p className="text-2xl font-bold text-blue-600">
                  {issues.filter((i) => i.status === "reported").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {issues.filter((i) => i.status === "in_progress").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {issues.filter((i) => i.status === "resolved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {issues.filter((i) => i.priority === "critical").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, address, or reporter..."
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filter by Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" onClick={fetchIssues}>
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Issues Directory
              {filteredIssues.length !== issues.length && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredIssues.length} of {issues.length})
                </span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIssues.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {issues.length === 0
                ? "No issues found."
                : "No issues match the selected filters."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue Details</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <TableRow
                        key={issue._id}
                        className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-semibold text-sm">
                              {issue.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {issue.description}
                            </p>
                            {issue.media.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-blue-600">
                                  📎 {issue.media.length} attachment(s)
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {issue.reporterId?.fullName ||
                                  issue.reporterId?.fullname ||
                                  "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {issue.reporterId?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadge(issue.category)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(issue.priority)}
                        </TableCell>
                        <TableCell>{getStatusBadge(issue.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {issue.address}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/department/issues/${issue._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} issues
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.totalPages ||
                          Math.abs(page - pagination.page) <= 1
                      )
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={
                              page === pagination.page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Issue Detail Dialog */}
      <IssueDetailDialog
        issueId={selectedIssueId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onIssueUpdate={handleIssueUpdate}
      />
    </div>
  );
};

export default IssuesManagementPage;
