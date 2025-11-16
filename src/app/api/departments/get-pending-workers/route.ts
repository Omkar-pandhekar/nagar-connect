import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import Department from "@/models/department.model";
import User from "@/models/user.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find department where user is the head
    const department = await Department.findOne({ headId: userId }).lean();

    if (!department) {
      return NextResponse.json(
        { error: "Department not found or user is not a department head" },
        { status: 404 }
      );
    }

    // Get all pending worker requests for this department
    const pendingWorkers = await FieldStaffProfile.find({
      department: department._id,
      approvalStatus: "pending",
    })
      .populate("userId", "fullName email phoneNumber")
      .populate("department", "name shortCode")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: pendingWorkers,
      department: {
        _id: department._id,
        name: department.name,
        shortCode: department.shortCode,
      },
    });
  } catch (error) {
    console.error("Get pending workers error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

