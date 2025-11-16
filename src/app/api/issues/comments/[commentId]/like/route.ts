import { ConnectDB } from "@/db/dbConfig";
import IssueComment from "@/models/issueComment.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

    const comment = await IssueComment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    const hasLiked = comment.likes.some((id) => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      comment.likes.push(userId as any);
    }

    await comment.save();

    return NextResponse.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: comment.likes.length,
      },
    });
  } catch (error) {
    console.error("Comment like error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle comment like" },
      { status: 500 }
    );
  }
}
