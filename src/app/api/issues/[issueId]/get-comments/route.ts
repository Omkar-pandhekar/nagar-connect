import { ConnectDB } from "@/db/dbConfig";
import IssueComment from "@/models/issueComment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueId: string }> }
) {
  try {
    await ConnectDB();
    const { issueId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get top-level comments (no parent)
    const comments = await IssueComment.find({
      issueId,
      parentCommentId: null,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email profilePicture")
      .lean();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await IssueComment.find({
          parentCommentId: comment._id,
        })
          .sort({ createdAt: 1 })
          .populate("userId", "fullName email profilePicture")
          .lean();

        return {
          ...comment,
          replies,
          repliesCount: replies.length,
        };
      })
    );

    const total = await IssueComment.countDocuments({
      issueId,
      parentCommentId: null,
    });

    return NextResponse.json({
      success: true,
      data: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
