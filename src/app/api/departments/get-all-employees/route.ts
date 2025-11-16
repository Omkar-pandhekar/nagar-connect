import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    let departmentId: mongoose.Types.ObjectId | null = null;

    // First, check if user is a department head
    const departmentAsHead = await Department.findOne({ headId: userId })
      .select("_id")
      .lean();
    if (departmentAsHead && !Array.isArray(departmentAsHead)) {
      const deptId = departmentAsHead._id;
      if (deptId) {
        departmentId =
          typeof deptId === "string"
            ? new mongoose.Types.ObjectId(deptId)
            : (deptId as mongoose.Types.ObjectId);
      }
    }

    // If not a head, check if user is a field staff member
    if (!departmentId) {
      const fieldStaffProfile = await FieldStaffProfile.findOne({
        userId: userId,
      }).lean();

      if (fieldStaffProfile?.department) {
        departmentId =
          typeof fieldStaffProfile.department === "object"
            ? (fieldStaffProfile.department as mongoose.Types.ObjectId)
            : new mongoose.Types.ObjectId(fieldStaffProfile.department);
      }
    }

    if (!departmentId) {
      return NextResponse.json(
        {
          error: "User is not associated with any department",
          message:
            "User must be either a department head or a field staff member",
        },
        { status: 400 }
      );
    }

    // Fetch only employees from the same department
    const employees = await FieldStaffProfile.find({
      department: departmentId,
    })
      .select("_id employeeId department role approvalStatus")
      .populate("department", "name shortCode")
      .populate("userId", "fullName email profilePicture")
      .lean();

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("Get all employees error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
