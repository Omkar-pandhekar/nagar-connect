import { ConnectDB } from "@/db/dbConfig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { NextRequest, NextResponse } from "next/server";
import IssueComment from "@/models/issueComment.model";
import Issue from "@/models/issue.model";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ issueId: string }> }
) {
  try {
    await ConnectDB();
    const { issueId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    const body = await request.json();
    const { text, parentCommentId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment text is required" },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await IssueComment.create({
      issueId,
      userId,
      text: text.trim(),
      parentCommentId: parentCommentId || null,
    });

    // Populate user info
    await comment.populate("userId", "fullName email profilePicture");

    // Update issue's comment count
    const commentsCount = await IssueComment.countDocuments({ issueId });
    await Issue.findByIdAndUpdate(issueId, {
      "socialStats.commentsCount": commentsCount,
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
