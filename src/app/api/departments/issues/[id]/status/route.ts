import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";

export async function PATCH(
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
    const { status, notes, acknowledgeReview } = await request.json();

    // Verify user has access
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const departmentAsHead = await Department.findOne({ headId: userId })
      .select("_id")
      .lean();

    if (
      !departmentAsHead ||
      Array.isArray(departmentAsHead) ||
      !departmentAsHead._id
    ) {
      return NextResponse.json(
        { error: "Only department heads can update status" },
        { status: 403 }
      );
    }

    const departmentId =
      typeof departmentAsHead._id === "string"
        ? new mongoose.Types.ObjectId(departmentAsHead._id)
        : (departmentAsHead._id as mongoose.Types.ObjectId);

    // Get the issue first to check for pending reviews
    const existingIssue = await Issue.findOne({
      _id: issueId,
      "assignedTo.department": departmentId,
    })
      .select("status statusReview")
      .lean();

    if (!existingIssue) {
      return NextResponse.json(
        { error: "Issue not found or not accessible" },
        { status: 404 }
      );
    }

    const issueData = existingIssue as any;

    // If acknowledgeReview is true, handle the review workflow
    if (acknowledgeReview === true) {
      if (
        !issueData.statusReview ||
        issueData.statusReview.reviewStatus !== "pending"
      ) {
        return NextResponse.json(
          { error: "No pending status review found" },
          { status: 400 }
        );
      }

      // Acknowledge the review - update status and clear review
      const updatedIssue = await Issue.findOneAndUpdate(
        {
          _id: issueId,
          "assignedTo.department": departmentId,
        },
        {
          $set: {
            status: issueData.statusReview.requestedStatus,
            "statusReview.reviewStatus": "approved",
            "statusReview.reviewedBy": userId,
            "statusReview.reviewedAt": new Date(),
            "statusReview.reviewNotes": notes || "Status review acknowledged",
          },
          $push: {
            timeline: {
              status: issueData.statusReview.requestedStatus,
              timestamp: new Date(),
              by: userId,
              notes:
                notes ||
                `Status review acknowledged. Status updated to ${issueData.statusReview.requestedStatus}`,
            },
          },
        },
        { new: true }
      )
        .populate("reporterId", "fullName email")
        .populate("assignedTo.staffId", "fullName email")
        .populate("statusReview.requestedBy", "fullName email")
        .populate("statusReview.reviewedBy", "fullName email")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Status review acknowledged successfully",
        data: updatedIssue,
      });
    }

    // Regular status update (if status is provided)
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "reported",
      "acknowledged",
      "assigned",
      "in_progress",
      "resolved",
      "rejected",
      "reopened",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update issue status
    const issue = await Issue.findOneAndUpdate(
      {
        _id: issueId,
        "assignedTo.department": departmentId,
      },
      {
        $set: { status },
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            by: userId,
            notes: notes || `Status updated to ${status}`,
          },
        },
      },
      { new: true }
    )
      .populate("reporterId", "fullName email")
      .populate("assignedTo.staffId", "fullName email")
      .populate("statusReview.requestedBy", "fullName email")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: issue,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
