"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Reporter {
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
}

interface Media {
  url: string;
  type: string;
  thumbnailUrl?: string;
}

interface Issue {
  _id: string;
  reporterId?: Reporter;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  address?: string;
  media?: Media[];
  socialStats?: {
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
  };
  userLiked?: boolean;
  userReposted?: boolean;
  createdAt: string | Date;
}

interface CommentUser {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
}

interface Comment {
  _id: string;
  userId?: CommentUser;
  text: string;
  likes?: string[];
  createdAt: string | Date;
  replies?: Comment[];
  repliesCount?: number;
}

const InstagramFeed = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Comments state
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<
    Record<string, boolean>
  >({});

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/issues/get-all-issues?page=${page}&limit=10&sortBy=createdAt&sortOrder=desc`
      );
      const data = await res.json();

      if (data.success) {
        setIssues((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleLike = async (issueId: string, isLiked?: boolean) => {
    // Optimistic update
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === issueId
          ? {
              ...issue,
              socialStats: {
                likesCount: isLiked
                  ? (issue.socialStats?.likesCount || 1) - 1
                  : (issue.socialStats?.likesCount || 0) + 1,
                commentsCount: issue.socialStats?.commentsCount || 0,
                repostsCount: issue.socialStats?.repostsCount || 0,
              },
              userLiked: !isLiked,
            }
          : issue
      )
    );

    try {
      const res = await fetch(`/api/issues/${issueId}/like`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        // Update with actual data from server
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId
              ? {
                  ...issue,
                  socialStats: {
                    likesCount: data.data.likesCount,
                    commentsCount: issue.socialStats?.commentsCount || 0,
                    repostsCount: issue.socialStats?.repostsCount || 0,
                  },
                  userLiked: data.data.liked,
                }
              : issue
          )
        );
      } else {
        // Revert optimistic update on error
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId
              ? {
                  ...issue,
                  userLiked: isLiked,
                  socialStats: {
                    likesCount: isLiked
                      ? (issue.socialStats?.likesCount || 0) + 1
                      : (issue.socialStats?.likesCount || 1) - 1,
                    commentsCount: issue.socialStats?.commentsCount || 0,
                    repostsCount: issue.socialStats?.repostsCount || 0,
                  },
                }
              : issue
          )
        );
        toast.error(data.error || "Failed to like issue");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                userLiked: isLiked,
                socialStats: {
                  likesCount: isLiked
                    ? (issue.socialStats?.likesCount || 0) + 1
                    : (issue.socialStats?.likesCount || 1) - 1,
                  commentsCount: issue.socialStats?.commentsCount || 0,
                  repostsCount: issue.socialStats?.repostsCount || 0,
                },
              }
            : issue
        )
      );
      toast.error("Failed to like issue");
    }
  };

  const handleRepost = async (issueId: string, isReposted?: boolean) => {
    // Optimistic update
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === issueId
          ? {
              ...issue,
              socialStats: {
                likesCount: issue.socialStats?.likesCount || 0,
                commentsCount: issue.socialStats?.commentsCount || 0,
                repostsCount: isReposted
                  ? (issue.socialStats?.repostsCount || 1) - 1
                  : (issue.socialStats?.repostsCount || 0) + 1,
              },
              userReposted: !isReposted,
            }
          : issue
      )
    );

    try {
      const res = await fetch(`/api/issues/${issueId}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: "" }),
      });
      const data = await res.json();

      if (data.success) {
        // Update with actual data from server
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId
              ? {
                  ...issue,
                  socialStats: {
                    likesCount: issue.socialStats?.likesCount || 0,
                    commentsCount: issue.socialStats?.commentsCount || 0,
                    repostsCount: data.data.repostsCount,
                  },
                  userReposted: data.data.reposted,
                }
              : issue
          )
        );
        toast.success(data.message);
      } else {
        // Revert on error
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId
              ? {
                  ...issue,
                  userReposted: isReposted,
                  socialStats: {
                    likesCount: issue.socialStats?.likesCount || 0,
                    commentsCount: issue.socialStats?.commentsCount || 0,
                    repostsCount: isReposted
                      ? (issue.socialStats?.repostsCount || 0) + 1
                      : (issue.socialStats?.repostsCount || 1) - 1,
                  },
                }
              : issue
          )
        );
        toast.error(data.error || "Failed to repost");
      }
    } catch (error) {
      // Revert on error
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                userReposted: isReposted,
                socialStats: {
                  likesCount: issue.socialStats?.likesCount || 0,
                  commentsCount: issue.socialStats?.commentsCount || 0,
                  repostsCount: isReposted
                    ? (issue.socialStats?.repostsCount || 0) + 1
                    : (issue.socialStats?.repostsCount || 1) - 1,
                },
              }
            : issue
        )
      );
      toast.error("Failed to repost issue");
    }
  };

  const toggleComments = async (issueId: string) => {
    if (showComments[issueId]) {
      setShowComments((prev) => ({ ...prev, [issueId]: false }));
    } else {
      setShowComments((prev) => ({ ...prev, [issueId]: true }));
      if (!comments[issueId]) {
        await fetchComments(issueId);
      }
    }
  };

  const fetchComments = async (issueId: string) => {
    setLoadingComments((prev) => ({ ...prev, [issueId]: true }));
    try {
      const res = await fetch(`/api/issues/${issueId}/get-comments`);
      const data = await res.json();

      if (data.success) {
        setComments((prev) => ({ ...prev, [issueId]: data.data }));
      } else {
        toast.error(data.error || "Failed to load comments");
      }
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [issueId]: false }));
    }
  };

  const handleAddComment = async (issueId: string) => {
    const text = commentText[issueId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/issues/${issueId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.success) {
        setComments((prev) => ({
          ...prev,
          [issueId]: [data.data, ...(prev[issueId] || [])],
        }));
        setCommentText((prev) => ({ ...prev, [issueId]: "" }));
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId
              ? {
                  ...issue,
                  socialStats: {
                    likesCount: issue.socialStats?.likesCount || 0,
                    commentsCount: (issue.socialStats?.commentsCount || 0) + 1,
                    repostsCount: issue.socialStats?.repostsCount || 0,
                  },
                }
              : issue
          )
        );
        toast.success("Comment added!");
      } else {
        toast.error(data.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const formatDate = (date: string | Date) => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateObj.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      reported: "bg-blue-100 text-blue-700",
      acknowledged: "bg-indigo-100 text-indigo-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      assigned: "bg-purple-100 text-purple-700",
      reopened: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-gray-600",
      medium: "text-blue-600",
      high: "text-orange-600",
      critical: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  if (loading && issues.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      {/* <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Civic Issues Feed</h1>
        </div>
      </div> */}

      {/* Feed */}
      <div className="max-w-2xl mx-auto pb-20">
        {issues.length === 0 && !loading ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No issues to display</p>
            <p className="text-sm mt-2">Be the first to report an issue!</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue._id} className="bg-white border-b mb-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {(issue.reporterId?.fullName ||
                      issue.reporterId?.name)?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {issue.reporterId?.fullName ||
                        issue.reporterId?.name ||
                        "Anonymous"}
                    </p>
                    {issue.address && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">
                          {issue.address.split(",")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              {issue.media?.[0]?.url && (
                <div className="relative w-full aspect-square bg-gray-100">
                  <Image
                    src={issue.media[0].url}
                    alt={issue.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Actions */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={() => handleLike(issue._id, issue.userLiked)}
                    className="hover:opacity-60 transition"
                    aria-label={issue.userLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      className={`w-7 h-7 transition-colors ${
                        issue.userLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => toggleComments(issue._id)}
                    className="hover:opacity-60 transition"
                    aria-label="Comments"
                  >
                    <MessageCircle className="w-7 h-7" />
                  </button>
                  <button
                    onClick={() => handleRepost(issue._id, issue.userReposted)}
                    className="hover:opacity-60 transition"
                    aria-label={issue.userReposted ? "Un-repost" : "Repost"}
                  >
                    <Share2
                      className={`w-7 h-7 transition-colors ${
                        issue.userReposted ? "text-green-600" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Stats */}
                <div className="mb-2">
                  <p className="font-semibold text-sm">
                    {issue.socialStats?.likesCount || 0}{" "}
                    {issue.socialStats?.likesCount === 1 ? "like" : "likes"}
                  </p>
                </div>

                {/* Caption */}
                <div className="mb-2">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">
                      {issue.reporterId?.fullName || issue.reporterId?.name}
                    </span>
                    <span>{issue.title}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {issue.description}
                  </p>
                </div>

                {/* Category & Priority Tags */}
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      issue.status
                    )}`}
                  >
                    {issue.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getPriorityColor(
                      issue.priority
                    )} font-semibold`}
                  >
                    {issue.priority.toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {issue.category}
                  </span>
                </div>

                {/* Comment Count */}
                {(issue.socialStats?.commentsCount || 0) > 0 && (
                  <button
                    onClick={() => toggleComments(issue._id)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    View all {issue.socialStats?.commentsCount}{" "}
                    {issue.socialStats?.commentsCount === 1
                      ? "comment"
                      : "comments"}
                  </button>
                )}

                {/* Time */}
                <p className="text-xs text-gray-400 mt-2 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(issue.createdAt)}
                </p>
              </div>

              {/* Comments Section */}
              {showComments[issue._id] && (
                <div className="border-t px-4 py-3 bg-gray-50">
                  {loadingComments[issue._id] ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Loading comments...
                    </div>
                  ) : comments[issue._id]?.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {comments[issue._id]?.map((comment) => (
                        <div key={comment._id} className="flex gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {comment.userId?.fullName?.[0]?.toUpperCase() ||
                              "U"}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold mr-2">
                                {comment.userId?.fullName || "Anonymous"}
                              </span>
                              <span>{comment.text}</span>
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                              <button className="text-xs text-gray-500 font-semibold hover:text-gray-700 transition">
                                Reply
                              </button>
                              <button className="text-xs text-gray-500 hover:text-gray-700 transition">
                                {comment.likes?.length || 0} likes
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[issue._id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [issue._id]: e.target.value,
                        }))
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddComment(issue._id)
                      }
                      className="flex-1 text-sm border-none outline-none bg-transparent"
                    />
                    <button
                      onClick={() => handleAddComment(issue._id)}
                      disabled={!commentText[issue._id]?.trim()}
                      className="text-blue-500 font-semibold text-sm disabled:opacity-50 transition"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && !loading && issues.length > 0 && (
          <div className="text-center py-8">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              Load More
            </button>
          </div>
        )}

        {loading && issues.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramFeed;
