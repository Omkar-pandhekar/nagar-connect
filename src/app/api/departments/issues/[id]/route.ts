import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";
import Department from "@/models/department.model";

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

    // Verify user has access to this issue (belongs to their department)
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
        { error: "User is not authorized to view this issue" },
        { status: 403 }
      );
    }

    const departmentId =
      typeof departmentAsHead._id === "string"
        ? new mongoose.Types.ObjectId(departmentAsHead._id)
        : (departmentAsHead._id as mongoose.Types.ObjectId);

    // Fetch issue with full details
    const issue = await Issue.findOne({
      _id: issueId,
      "assignedTo.department": departmentId,
    })
      .populate("reporterId", "fullName email profilePicture")
      .populate("assignedTo.department", "name shortCode")
      .populate("assignedTo.staffId", "fullName email profilePicture")
      .populate("timeline.by", "fullName")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error("Get issue details error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
