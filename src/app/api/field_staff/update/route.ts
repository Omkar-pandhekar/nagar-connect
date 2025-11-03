import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import User from "@/models/user.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(request: NextRequest) {
  try {
    await ConnectDB();

    // Try to get session from cookies (browser requests)
    const session = await getServerSession(authOptions);

    let userEmail: string | undefined;
    let userId: string | undefined;

    // Check if session exists (browser authentication)
    if (session?.user?.email && session?.user?.id) {
      userEmail = session.user.email;
      userId = session.user.id;
    } else {
      // Fallback: Check for Authorization header (Postman/testing)
      const authHeader = request.headers.get("authorization");

      if (authHeader && authHeader.startsWith("Bearer ")) {
        // For Postman: Use email as token (development/testing only)
        const email = authHeader.replace("Bearer ", "").trim();

        // Verify user exists
        const testUser = await User.findOne({ email });
        if (testUser) {
          userEmail = testUser.email;
          userId = testUser._id.toString();
        }
      }
    }

    if (!userEmail || !userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Please provide authentication via session cookie or Authorization header (Bearer email)",
        },
        { status: 401 }
      );
    }

    const reqBody = await request.json();
    const { employeeId, department, role, address, location, seekApproval } =
      reqBody;

    // Find the field staff profile
    const fieldStaffProfile = await FieldStaffProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!fieldStaffProfile) {
      return NextResponse.json(
        { error: "Field staff profile not found" },
        { status: 404 }
      );
    }

    // Prepare update object
    const updateData: any = {};

    // Update employeeId if provided
    if (employeeId !== undefined && employeeId.trim() !== "") {
      // Check if employeeId is already taken by another user
      const existingProfile = await FieldStaffProfile.findOne({
        employeeId: employeeId.trim(),
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
      });
      if (existingProfile) {
        return NextResponse.json(
          { error: "Employee ID is already taken" },
          { status: 400 }
        );
      }
      updateData.employeeId = employeeId.trim();
    }

    // Update department if provided
    if (department !== undefined && department.trim() !== "") {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return NextResponse.json(
          { error: "Invalid department ID" },
          { status: 400 }
        );
      }
      updateData.department = new mongoose.Types.ObjectId(department);
    }

    // Update role if provided
    if (role !== undefined && role.trim() !== "") {
      const validRoles = [
        "Team Member",
        "Supervisor",
        "Manager",
        "Department Head",
      ];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Role must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    // Update address if provided
    if (address !== undefined) {
      updateData.address = {};
      if (address.street !== undefined) {
        updateData.address.street = address.street.trim() || undefined;
      }
      if (address.city !== undefined) {
        updateData.address.city = address.city.trim() || undefined;
      }
      if (address.pincode !== undefined) {
        if (address.pincode && !/^\d{6}$/.test(address.pincode.trim())) {
          return NextResponse.json(
            { error: "Pincode must be a valid 6-digit number" },
            { status: 400 }
          );
        }
        updateData.address.pincode = address.pincode.trim() || undefined;
      }
    }

    // Update location if provided
    if (location !== undefined && location.coordinates) {
      const [longitude, latitude] = location.coordinates;
      if (
        typeof longitude !== "number" ||
        typeof latitude !== "number" ||
        isNaN(longitude) ||
        isNaN(latitude)
      ) {
        return NextResponse.json(
          { error: "Invalid location coordinates" },
          { status: 400 }
        );
      }
      updateData.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    // Handle approval status change
    if (seekApproval === true) {
      // When seeking approval, set status to pending
      // Only allow this if current status is not already approved
      if (fieldStaffProfile.approvalStatus === "approved") {
        return NextResponse.json(
          {
            error:
              "Cannot seek approval again. Your profile is already approved.",
          },
          { status: 400 }
        );
      }
      updateData.approvalStatus = "pending";
    }

    // Update field staff profile
    const updatedProfile = await FieldStaffProfile.findByIdAndUpdate(
      fieldStaffProfile._id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("department", "name shortCode")
      .lean();

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Failed to update field staff profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: seekApproval
        ? "Profile updated and approval requested successfully"
        : "Field staff profile updated successfully",
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Field Staff Update API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Handle duplicate key error (unique constraint violation)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      const field = Object.keys((error as any).keyPattern || {})[0];
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
