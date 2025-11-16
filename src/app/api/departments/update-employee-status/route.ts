import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import Department from "@/models/department.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(request: NextRequest) {
  try {
    await ConnectDB();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find department where user is the head
    const department = await Department.findOne({ headId: userId });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found or user is not a department head" },
        { status: 404 }
      );
    }

    const reqBody = await request.json();
    const { workerId, approvalStatus } = reqBody;

    if (!workerId || !approvalStatus) {
      return NextResponse.json(
        { error: "workerId and approvalStatus are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        { error: "approvalStatus must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Find the worker profile
    const workerProfile = await FieldStaffProfile.findOne({
      _id: new mongoose.Types.ObjectId(workerId),
      department: department._id,
    });

    if (!workerProfile) {
      return NextResponse.json(
        { error: "Worker not found or does not belong to your department" },
        { status: 404 }
      );
    }

    // Update approval status
    workerProfile.approvalStatus = approvalStatus as "approved" | "rejected";
    await workerProfile.save();

    // If approved, add user to department members
    if (approvalStatus === "approved") {
      await Department.findByIdAndUpdate(
        department._id.toString(),
        {
          $addToSet: { members: workerProfile.userId },
        },
        { new: true }
      );
    }

    // Return updated profile
    const updatedProfile = await FieldStaffProfile.findById(workerProfile._id)
      .populate("userId", "fullName email phoneNumber")
      .populate("department", "name shortCode")
      .lean();

    return NextResponse.json({
      success: true,
      message: `Worker request ${approvalStatus} successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update employee status error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
