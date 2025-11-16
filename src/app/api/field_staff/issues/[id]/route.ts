import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";

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

    // Verify user is an approved field staff member
    const fieldStaffProfile = await FieldStaffProfile.findOne({
      userId: userId,
      approvalStatus: "approved",
    }).lean();

    if (!fieldStaffProfile) {
      return NextResponse.json(
        { error: "User is not an approved field staff member" },
        { status: 403 }
      );
    }

    // Fetch issue assigned to this worker
    const issue = await Issue.findOne({
      _id: issueId,
      "assignedTo.staffId": userId,
    })
      .populate("reporterId", "fullName email profilePicture")
      .populate("assignedTo.staffId", "fullName email profilePicture")
      .populate("timeline.by", "fullName email")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Manually populate department and statusReview fields
    const User = (await import("@/models/user.model")).default;
    const issueData = issue as any;

    // Manually populate department
    if (issueData.assignedTo?.department) {
      try {
        const department = await Department.findById(
          issueData.assignedTo.department
        )
          .select("name shortCode")
          .lean();
        if (department) {
          issueData.assignedTo.department = department;
        }
      } catch (err) {
        console.error("Error populating assignedTo.department:", err);
      }
    }

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
