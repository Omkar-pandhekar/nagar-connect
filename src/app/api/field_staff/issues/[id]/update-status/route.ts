import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";

export async function PUT(
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

    // Verify the issue is assigned to this worker
    const existingIssue = await Issue.findOne({
      _id: issueId,
      "assignedTo.staffId": userId,
    }).lean();

    if (!existingIssue) {
      return NextResponse.json(
        { error: "Issue not found or not assigned to you" },
        { status: 404 }
      );
    }

    const { status, notes, resolutionSummary } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status - workers can only set certain statuses
    const allowedStatuses = ["in_progress", "resolved"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Workers can only set status to: ${allowedStatuses.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // If status is "resolved", it needs department review
    // If status is "in_progress", update directly
    if (status === "in_progress") {
      const updatedIssue = await Issue.findByIdAndUpdate(
        issueId,
        {
          $set: { status: "in_progress" },
          $push: {
            timeline: {
              status: "in_progress",
              timestamp: new Date(),
              by: userId,
              notes: notes || "Status updated to in progress",
            },
          },
        },
        { new: true }
      )
        .populate("reporterId", "fullName email profilePicture")
        .populate("assignedTo.staffId", "fullName email")
        .populate("assignedTo.department", "name shortCode")
        .populate("statusReview.requestedBy", "fullName email")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Status updated successfully",
        data: updatedIssue,
      });
    }

    // For "resolved" status, create a review request
    const updateData: any = {
      $set: {
        statusReview: {
          requestedStatus: "resolved",
          requestedBy: userId,
          requestedAt: new Date(),
          reviewStatus: "pending",
        },
      },
      $push: {
        timeline: {
          status: (existingIssue as any[])[0].status, // Keep current status
          timestamp: new Date(),
          by: userId,
          notes:
            notes ||
            "Resolution requested - pending department review and acknowledgment",
        },
      },
    };

    // If resolutionSummary is provided, update it
    if (resolutionSummary) {
      updateData.$set["resolutionDetails.resolutionSummary"] =
        resolutionSummary;
      updateData.$set["resolutionDetails.resolvedBy"] = userId;
      updateData.$set["resolutionDetails.resolvedDate"] = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(issueId, updateData, {
      new: true,
    })
      .populate("reporterId", "fullName email profilePicture")
      .populate("assignedTo.staffId", "fullName email")
      .populate("assignedTo.department", "name shortCode")
      .populate("statusReview.requestedBy", "fullName email")
      .lean();

    if (!updatedIssue) {
      return NextResponse.json(
        { error: "Failed to update issue" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Resolution request submitted. Waiting for department review and acknowledgment.",
      data: updatedIssue,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
