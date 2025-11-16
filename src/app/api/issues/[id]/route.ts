import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { id } = await params;

    // Validate issueId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid issue ID format" },
        { status: 400 }
      );
    }

    const issueId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Fetch issue and verify it belongs to the user
    const issue = await Issue.findOne({
      _id: issueId,
      reporterId: userId,
    })
      .populate("reporterId", "fullName email profilePicture")
      .populate("assignedTo.department", "name shortCode")
      .populate("assignedTo.staffId", "fullName email profilePicture")
      .populate("timeline.by", "fullName email")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found or you don't have permission to view it" },
        { status: 404 }
      );
    }

    // Manually populate statusReview fields if they exist
    const User = (await import("@/models/user.model")).default;
    const issueData = issue as any;

    if (issueData.statusReview?.requestedBy) {
      try {
        const requestedByUser = await User.findById(
          issueData.statusReview.requestedBy
        )
          .select("fullName email")
          .lean();
        if (requestedByUser) {
          issueData.statusReview.requestedBy = requestedByUser;
        }
      } catch (err) {
        console.error("Error populating statusReview.requestedBy:", err);
      }
    }

    if (issueData.statusReview?.reviewedBy) {
      try {
        const reviewedByUser = await User.findById(
          issueData.statusReview.reviewedBy
        )
          .select("fullName email")
          .lean();
        if (reviewedByUser) {
          issueData.statusReview.reviewedBy = reviewedByUser;
        }
      } catch (err) {
        console.error("Error populating statusReview.reviewedBy:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: issueData,
    });
  } catch (error) {
    console.error("Get issue details error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

