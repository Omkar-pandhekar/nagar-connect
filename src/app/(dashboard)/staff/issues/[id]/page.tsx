"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Loader2,
  UserCheck,
  Upload,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------
  // FETCH ISSUE
  // --------------------------------------------------------------
  useEffect(() => {
    fetchIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchIssue() {
    try {
      const res = await fetch(`/api/field_staff/issues/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setIssue(data.data);
        setNewStatus(data.data.status);
        if (data.data.resolutionDetails?.resolutionSummary) {
          setResolutionSummary(data.data.resolutionDetails.resolutionSummary);
        }
      } else {
        toast.error(data.error || "Failed to load issue");
      }
    } catch (error) {
      toast.error("Failed to load issue");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------------------
  // STATUS UPDATE
  // --------------------------------------------------------------
  async function updateStatus() {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/field_staff/issues/${id}/update-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes,
          resolutionSummary:
            newStatus === "resolved" ? resolutionSummary : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        fetchIssue();
        setNotes("");
        if (newStatus !== "resolved") {
          setResolutionSummary("");
        }
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  // --------------------------------------------------------------
  // PHOTO UPLOAD
  // --------------------------------------------------------------
  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/field_staff/issues/${id}/upload-photo`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Photo uploaded successfully");
        fetchIssue();
      } else {
        toast.error(data.error || "Failed to upload photo");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // --------------------------------------------------------------
  // UTIL FUNCTIONS
  // --------------------------------------------------------------
  const getIcon = (s: string) =>
    ({
      reported: AlertCircle,
      acknowledged: Clock,
      assigned: UserCheck,
      in_progress: Clock,
      resolved: CheckCircle,
      rejected: XCircle,
      reopened: AlertCircle,
    }[s] || AlertCircle);

  const getStatusColor = (s: string) =>
    ({
      reported: "bg-blue-100 text-blue-700",
      acknowledged: "bg-indigo-100 text-indigo-700",
      assigned: "bg-purple-100 text-purple-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      reopened: "bg-orange-100 text-orange-700",
    }[s] || "bg-gray-100 text-gray-700");

  const getPriorityColor = (p: string) =>
    ({
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
    }[p] || "bg-gray-100 text-gray-700");

  const getMediaIcon = (t: string) =>
    ({ image: ImageIcon, video: Video }[t] || ImageIcon);

  // --------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------
  if (loading)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (!issue) return <div>No issue found</div>;

  const StatusIcon = getIcon(issue.status);
  const hasPendingReview =
    issue.statusReview?.reviewStatus === "pending" &&
    issue.statusReview?.requestedStatus === "resolved";

  // --------------------------------------------------------------
  // PAGE UI
  // --------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <AlertCircle className="w-7 h-7 text-blue-600" />
          {issue.title}
        </h1>
        <p className="text-gray-500 text-sm">
          Issue ID: {issue._id} •{" "}
          {new Date(issue.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getStatusColor(issue.status)} px-3 py-1`}>
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

              {/* Status Review Alert */}
              {hasPendingReview && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Resolution Pending Review
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your resolution request is waiting for department
                        acknowledgment. Status will be updated once reviewed.
                      </p>
                      {issue.statusReview?.requestedAt && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Requested on:{" "}
                          {new Date(
                            issue.statusReview.requestedAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status update */}
              <div className="pt-4 border-t space-y-3">
                <label className="text-sm font-medium">Update Status</label>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    disabled={updating}
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <Button
                    size="sm"
                    disabled={updating || newStatus === issue.status}
                    onClick={updateStatus}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
                <textarea
                  placeholder="Add notes (optional)"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm resize-y"
                  disabled={updating}
                />
                {newStatus === "resolved" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Resolution Summary *
                    </label>
                    <textarea
                      placeholder="Describe how the issue was resolved..."
                      value={resolutionSummary}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setResolutionSummary(e.target.value)
                      }
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm resize-y"
                      disabled={updating}
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Resolution Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outline"
                    disabled={uploading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Photo
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500">
                  Upload photos showing the resolution (Max 10MB)
                </p>
              </div>

              {/* Resolution Media */}
              {issue.resolutionDetails?.resolutionMedia &&
                issue.resolutionDetails.resolutionMedia.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
                    {issue.resolutionDetails.resolutionMedia.map(
                      (media: any, i: number) => {
                        const Icon = getMediaIcon(media.type);
                        return (
                          <div
                            key={i}
                            className="relative group border rounded-lg overflow-hidden"
                          >
                            <img
                              src={media.url}
                              alt={`Resolution ${i + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="opacity-0 group-hover:opacity-100"
                                onClick={() => window.open(media.url, "_blank")}
                              >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {issue.description}
              </p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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

          {/* Original Media */}
          {issue.media && issue.media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Original Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {issue.media.map((m: any, i: number) => {
                    const Icon = getMediaIcon(m.type);
                    return (
                      <div
                        key={i}
                        onClick={() => window.open(m.url, "_blank")}
                        className="border rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <img
                          src={m.url}
                          alt={m.type}
                          className="w-full h-full object-cover rounded"
                        />
                        <span className="text-xs text-gray-500">{m.type}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {issue.timeline && issue.timeline.length > 0 ? (
                issue.timeline.map((entry: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          idx === 0 ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                      {idx < issue.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">
                        {entry.status.replace("_", " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}{" "}
                        {entry.by && `• ${entry.by.fullName || entry.by}`}
                      </p>
                      {entry.notes && (
                        <div className="text-xs text-gray-600 mt-1">
                          <p>{entry.notes}</p>
                          {/* Extract URL from notes if present */}
                          {entry.notes.includes("URL:") && (
                            <a
                              href={entry.notes.split("URL:")[1]?.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                            >
                              <ImageIcon className="w-3 h-3" />
                              View Photo
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No timeline entries</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Reporter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Reporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={issue.reporterId?.profilePicture} />
                  <AvatarFallback>
                    {issue.reporterId?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {issue.reporterId?.fullName || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {issue.reporterId?.email || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department */}
          {issue.assignedTo?.department && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  Assigned Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-sm">
                  {issue.assignedTo.department.name}
                </p>
                <p className="text-xs text-gray-500">
                  {issue.assignedTo.department.shortCode}
                </p>
                {issue.assignedTo.assignedDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Assigned on:{" "}
                    {new Date(
                      issue.assignedTo.assignedDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Review Info */}
          {issue.statusReview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Review Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Requested Status</p>
                  <p className="text-sm font-medium">
                    {issue.statusReview.requestedStatus?.toUpperCase()}
                  </p>
                </div>
                {issue.statusReview.reviewStatus && (
                  <div>
                    <p className="text-xs text-gray-500">Review Status</p>
                    <Badge
                      className={
                        issue.statusReview.reviewStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : issue.statusReview.reviewStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {issue.statusReview.reviewStatus === "approved" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : issue.statusReview.reviewStatus === "rejected" ? (
                        <X className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {issue.statusReview.reviewStatus.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {issue.statusReview.reviewedBy && (
                  <div>
                    <p className="text-xs text-gray-500">Reviewed By</p>
                    <p className="text-sm">
                      {issue.statusReview.reviewedBy.fullName ||
                        issue.statusReview.reviewedBy}
                    </p>
                  </div>
                )}
                {issue.statusReview.reviewedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Reviewed At</p>
                    <p className="text-sm">
                      {new Date(issue.statusReview.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {issue.statusReview.reviewNotes && (
                  <div>
                    <p className="text-xs text-gray-500">Review Notes</p>
                    <p className="text-sm">{issue.statusReview.reviewNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resolution Details */}
          {issue.resolutionDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {issue.resolutionDetails.resolutionSummary && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Summary</p>
                    <p className="text-sm">
                      {issue.resolutionDetails.resolutionSummary}
                    </p>
                  </div>
                )}
                {issue.resolutionDetails.resolvedDate && (
                  <div>
                    <p className="text-xs text-gray-500">Resolved Date</p>
                    <p className="text-sm">
                      {new Date(
                        issue.resolutionDetails.resolvedDate
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social stats */}
          {issue.socialStats && (
            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">
                    {issue.socialStats.likesCount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">
                    {issue.socialStats.commentsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reposts</span>
                  <span className="font-medium">
                    {issue.socialStats.repostsCount || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
