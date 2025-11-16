import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import IssueComment from "@/models/issueComment.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await ConnectDB();
    const { commentId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Find comment and check ownership
    const comment = await IssueComment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    const issueId = comment.issueId;

    // Delete comment and its replies
    await IssueComment.deleteMany({
      $or: [{ _id: commentId }, { parentCommentId: commentId }],
    });

    // Update issue's comment count
    const commentsCount = await IssueComment.countDocuments({ issueId });
    await Issue.findByIdAndUpdate(issueId, {
      "socialStats.commentsCount": commentsCount,
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
