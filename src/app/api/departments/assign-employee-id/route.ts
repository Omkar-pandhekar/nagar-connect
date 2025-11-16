import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const body = await request.json();
    const { fieldStaffId, employeeId } = body;

    // Validate required fields
    if (!fieldStaffId || !employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Field staff ID and employee ID are required",
        },
        { status: 400 }
      );
    }

    // Validate employee ID format (you can customize this)
    const employeeIdRegex = /^[A-Z0-9-]+$/;
    if (!employeeIdRegex.test(employeeId.trim())) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid employee ID format. Use uppercase letters, numbers, and hyphens only",
        },
        { status: 400 }
      );
    }

    // Check if employee ID already exists
    const existingEmployee = await FieldStaffProfile.findOne({
      employeeId: employeeId.trim(),
      _id: { $ne: fieldStaffId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: "This employee ID is already assigned to another employee",
        },
        { status: 400 }
      );
    }

    // Find and update the field staff profile
    const updatedProfile = await FieldStaffProfile.findByIdAndUpdate(
      fieldStaffId,
      {
        employeeId: employeeId.trim().toUpperCase(),
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("department", "name shortCode")
      .populate("userId", "fullName email");

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: "Field staff profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Employee ID assigned successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error assigning employee ID:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to assign employee ID",
      },
      { status: 500 }
    );
  }
}
