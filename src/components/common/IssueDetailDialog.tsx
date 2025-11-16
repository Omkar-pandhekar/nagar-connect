"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  MapPin,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Navigation,
  Image as ImageIcon,
  Video,
  AudioLines,
  Loader2,
  UserCheck,
  Briefcase,
} from "lucide-react";

interface IssueDetailDialogProps {
  issueId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssueUpdate?: () => void;
}

interface TimelineEntry {
  status: string;
  timestamp: string;
  by?: {
    _id: string;
    fullName: string;
  };
  notes?: string;
}

interface Worker {
  _id: string;
  employeeId: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  role: string;
  approvalStatus: string;
  distance?: number;
}

interface IssueDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  media: Array<{
    url: string;
    type: "image" | "video" | "audio";
    thumbnailUrl?: string;
  }>;
  reporterId: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  assignedTo?: {
    department: { _id: string; name: string; shortCode: string };
    staffId?: {
      _id: string;
      fullName: string;
      email: string;
      profilePicture?: string;
    };
    assignedDate?: string;
  };
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
  expectedResolutionDate?: string;
  socialStats: {
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
  };
}

export default function IssueDetailDialog({
  issueId,
  open,
  onOpenChange,
  onIssueUpdate,
}: IssueDetailDialogProps) {
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningWorker, setAssigningWorker] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    if (open && issueId) {
      fetchIssueDetails();
      fetchNearbyWorkers();
    }
  }, [open, issueId]);

  const fetchIssueDetails = async () => {
    if (!issueId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/departments/issues/${issueId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setIssue(data.data);
        setNewStatus(data.data.status);
      } else {
        toast.error(data.error || "Failed to fetch issue details");
      }
    } catch {
      toast.error("Failed to fetch issue details");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyWorkers = async () => {
    if (!issueId) return;
    try {
      const res = await fetch(
        `/api/departments/issues/${issueId}/nearby-workers`
      );
      const data = await res.json();
      if (res.ok && data.success) setWorkers(data.data);
    } catch {}
  };

  const handleAssignWorker = async (workerId: string) => {
    if (!issueId) return;
    setAssigningWorker(true);
    try {
      const res = await fetch(`/api/departments/issues/${issueId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: workerId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Worker assigned successfully");
        fetchIssueDetails();
        onIssueUpdate?.();
      } else toast.error(data.error || "Failed to assign worker");
    } catch {
      toast.error("Failed to assign worker");
    } finally {
      setAssigningWorker(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!issueId || !newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/departments/issues/${issueId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: statusNotes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Status updated");
        fetchIssueDetails();
        onIssueUpdate?.();
        setStatusNotes("");
      } else toast.error(data.error || "Failed to update status");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      reported: AlertCircle,
      acknowledged: Clock,
      assigned: UserCheck,
      in_progress: Clock,
      resolved: CheckCircle,
      rejected: XCircle,
      reopened: AlertCircle,
    } as Record<string, any>;
    return icons[status] || AlertCircle;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      reported: "bg-blue-100 text-blue-700",
      acknowledged: "bg-indigo-100 text-indigo-700",
      assigned: "bg-purple-100 text-purple-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      reopened: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const getMediaIcon = (type: string) => {
    const icons = { image: ImageIcon, video: Video, audio: AudioLines };
    return icons[type] || ImageIcon;
  };

  if (loading)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </DialogContent>
      </Dialog>
    );

  if (!issue) return null;

  const StatusIcon = getStatusIcon(issue.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6">
        <DialogHeader className="space-y-1 mb-4">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            {issue.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            ID: {issue._id} • {new Date(issue.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status + Priority */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Status & Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    className={`${getStatusColor(issue.status)} px-3 py-1`}
                  >
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {issue.status.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge
                    className={`${getPriorityColor(issue.priority)} px-3 py-1`}
                  >
                    {issue.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    {issue.category}
                  </Badge>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <label className="text-sm font-medium">Update Status</label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="reported">Reported</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                      <option value="reopened">Reopened</option>
                    </select>
                    <Button
                      size="sm"
                      onClick={handleStatusUpdate}
                      disabled={updatingStatus || newStatus === issue.status}
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                  <input
                    placeholder="Add notes (optional)"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {issue.description}
                </p>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">{issue.address}</p>
                <p className="text-xs text-gray-500">
                  {issue.location.coordinates[1].toFixed(6)},{" "}
                  {issue.location.coordinates[0].toFixed(6)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${issue.location.coordinates[1]},${issue.location.coordinates[0]}`,
                      "_blank"
                    )
                  }
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              </CardContent>
            </Card>

            {/* Media */}
            {issue.media.length > 0 && (
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {issue.media.map((m, i) => {
                      const MediaIcon = getMediaIcon(m.type);
                      return (
                        <div
                          key={i}
                          className="border rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => window.open(m.url, "_blank")}
                        >
                          <MediaIcon className="w-7 h-7 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {m.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {issue.timeline.map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          idx === 0 ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                      {idx !== issue.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">
                        {entry.status.replace("_", " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                        {entry.by && ` • ${entry.by.fullName}`}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Reporter */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Reporter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={issue.reporterId.profilePicture} />
                    <AvatarFallback>
                      {issue.reporterId.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {issue.reporterId.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {issue.reporterId.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Worker */}
            {issue.assignedTo?.staffId && (
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Assigned Worker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={issue.assignedTo.staffId.profilePicture}
                      />
                      <AvatarFallback>
                        {issue.assignedTo.staffId.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {issue.assignedTo.staffId.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {issue.assignedTo.staffId.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Assigned:{" "}
                    {issue.assignedTo.assignedDate
                      ? new Date(
                          issue.assignedTo.assignedDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Workers */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Available Workers
                  <Badge variant="outline" className="ml-auto">
                    {workers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto space-y-3">
                {workers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No workers available
                  </p>
                ) : (
                  workers.map((worker) => (
                    <div
                      key={worker._id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={worker.userId.profilePicture} />
                        <AvatarFallback>
                          {worker.userId.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {worker.userId.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {worker.employeeId}
                        </p>
                        {worker.distance !== undefined && (
                          <p className="text-xs text-blue-600 mt-1">
                            <Navigation className="w-3 h-3 inline-block mr-1" />
                            {worker.distance.toFixed(2)} km away
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        disabled={
                          assigningWorker ||
                          issue.assignedTo?.staffId?._id === worker.userId._id
                        }
                        onClick={() => handleAssignWorker(worker.userId._id)}
                      >
                        {issue.assignedTo?.staffId?._id === worker.userId._id
                          ? "Assigned"
                          : "Assign"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Social Stats */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">
                    {issue.socialStats.likesCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">
                    {issue.socialStats.commentsCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reposts</span>
                  <span className="font-medium">
                    {issue.socialStats.repostsCount}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
