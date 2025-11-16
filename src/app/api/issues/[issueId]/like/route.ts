import { ConnectDB } from "@/db/dbConfig";
import IssueLike from "@/models/issueLike.model";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";

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

    // Check if like already exists
    let like = await IssueLike.findOne({ issueId, userId });

    if (like) {
      // Toggle active status
      like.active = !like.active;
      await like.save();
    } else {
      // Create new like
      like = await IssueLike.create({ issueId, userId, active: true });
    }

    // Update issue's like count
    const activeLikesCount = await IssueLike.countDocuments({
      issueId,
      active: true,
    });

    await Issue.findByIdAndUpdate(issueId, {
      "socialStats.likesCount": activeLikesCount,
    });

    return NextResponse.json({
      success: true,
      data: {
        liked: like.active,
        likesCount: activeLikesCount,
      },
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
