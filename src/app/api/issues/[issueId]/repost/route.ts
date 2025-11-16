import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import IssueRepost from "@/models/issueRepost.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { NextRequest, NextResponse } from "next/server";

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
    const { caption } = body;

    // Check if already reposted
    const existingRepost = await IssueRepost.findOne({ issueId, userId });

    if (existingRepost) {
      // Delete repost (un-repost)
      await IssueRepost.findByIdAndDelete(existingRepost._id);

      const repostsCount = await IssueRepost.countDocuments({ issueId });
      await Issue.findByIdAndUpdate(issueId, {
        "socialStats.repostsCount": repostsCount,
      });

      return NextResponse.json({
        success: true,
        data: { reposted: false, repostsCount },
        message: "Repost removed",
      });
    }

    // Create new repost
    const repost = await IssueRepost.create({
      issueId,
      userId,
      caption: caption || null,
    });

    // Update issue's repost count
    const repostsCount = await IssueRepost.countDocuments({ issueId });
    await Issue.findByIdAndUpdate(issueId, {
      "socialStats.repostsCount": repostsCount,
    });

    return NextResponse.json({
      success: true,
      data: { reposted: true, repostsCount },
      message: "Issue reposted successfully",
    });
  } catch (error) {
    console.error("Repost error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to repost issue" },
      { status: 500 }
    );
  }
}
