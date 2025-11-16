import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import Department from "@/models/department.model";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";

export async function POST(
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
    const { staffId } = await request.json();

    // Validate IDs format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid issue ID format" },
        { status: 400 }
      );
    }

    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return NextResponse.json(
        { error: "Invalid staff ID format" },
        { status: 400 }
      );
    }

    const issueId = new mongoose.Types.ObjectId(id);
    const staffObjectId = new mongoose.Types.ObjectId(staffId);

    // Verify user has access (is department head)
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
        { error: "Only department heads can assign workers" },
        { status: 403 }
      );
    }

    const departmentId =
      typeof departmentAsHead._id === "string"
        ? new mongoose.Types.ObjectId(departmentAsHead._id)
        : (departmentAsHead._id as mongoose.Types.ObjectId);

    // Verify the staff belongs to the same department
    const staffProfile = await FieldStaffProfile.findOne({
      userId: staffObjectId,
      department: departmentId,
      approvalStatus: "approved",
    })
      .populate("userId", "fullName email")
      .lean();

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Staff not found or not approved in this department" },
        { status: 404 }
      );
    }

    // Update issue with assignment
    const issue = await Issue.findOneAndUpdate(
      {
        _id: issueId,
        "assignedTo.department": departmentId,
      },
      {
        $set: {
          "assignedTo.staffId": staffObjectId,
          "assignedTo.assignedDate": new Date(),
          status: "assigned",
        },
        $push: {
          timeline: {
            status: "assigned",
            timestamp: new Date(),
            by: userId,
            notes: `Assigned to ${
              (staffProfile?.userId as any)?.fullName ||
              staffProfile?.userId ||
              "worker"
            }`,
          },
        },
      },
      { new: true }
    )
      .populate("assignedTo.staffId", "fullName email")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Worker assigned successfully",
      data: issue,
    });
  } catch (error) {
    console.error("Assign worker error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
