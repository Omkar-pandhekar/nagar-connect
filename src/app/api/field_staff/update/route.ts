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

    const validRoles = [
      "Team Member",
      "Supervisor",
      "Manager",
      "Department Head",
    ];

    const convertDepartment = (deptId: string) => {
      if (!mongoose.Types.ObjectId.isValid(deptId)) {
        throw new Error("INVALID_DEPARTMENT");
      }
      return new mongoose.Types.ObjectId(deptId);
    };

    const normalizeAddress = () => {
      if (address === undefined) return undefined;
      const normalized: Record<string, string | undefined> = {};
      if (address.street !== undefined) {
        normalized.street = address.street.trim() || undefined;
      }
      if (address.city !== undefined) {
        normalized.city = address.city.trim() || undefined;
      }
      if (address.pincode !== undefined) {
        if (address.pincode && !/^\d{6}$/.test(address.pincode.trim())) {
          throw new Error("INVALID_PINCODE");
        }
        normalized.pincode = address.pincode.trim() || undefined;
      }
      return normalized;
    };

    const normalizeLocation = () => {
      if (location === undefined || !location.coordinates) return undefined;
      const [longitude, latitude] = location.coordinates;
      if (
        typeof longitude !== "number" ||
        typeof latitude !== "number" ||
        isNaN(longitude) ||
        isNaN(latitude)
      ) {
        throw new Error("INVALID_LOCATION");
      }
      return {
        type: "Point" as const,
        coordinates: [longitude, latitude] as [number, number],
      };
    };

    const profile = await FieldStaffProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Prepare shared update data
    const updateData: any = {};

    if (employeeId !== undefined && employeeId.trim() !== "") {
      const normalizedEmployeeId = employeeId.trim();
      const existingProfile = await FieldStaffProfile.findOne({
        employeeId: normalizedEmployeeId,
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
      });
      if (existingProfile) {
        return NextResponse.json(
          { error: "Employee ID is already taken" },
          { status: 400 }
        );
      }
      updateData.employeeId = normalizedEmployeeId;
    }

    if (department !== undefined && department.trim() !== "") {
      try {
        updateData.department = convertDepartment(department.trim());
      } catch {
        return NextResponse.json(
          { error: "Invalid department ID" },
          { status: 400 }
        );
      }
    }

    if (role !== undefined && role.trim() !== "") {
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Role must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    try {
      const normalizedAddress = normalizeAddress();
      if (normalizedAddress) {
        updateData.address = normalizedAddress;
      }
      const normalizedLocation = normalizeLocation();
      if (normalizedLocation) {
        updateData.location = normalizedLocation;
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "INVALID_PINCODE") {
          return NextResponse.json(
            { error: "Pincode must be a valid 6-digit number" },
            { status: 400 }
          );
        }
        if (err.message === "INVALID_LOCATION") {
          return NextResponse.json(
            { error: "Invalid location coordinates" },
            { status: 400 }
          );
        }
      }
      throw err;
    }

    if (profile) {
      if (seekApproval === true) {
        if (profile.approvalStatus === "approved") {
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

      const updatedProfile = await FieldStaffProfile.findByIdAndUpdate(
        profile._id,
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
    }

    // Creating a new profile because one doesn't exist
    if (!department || department.trim() === "") {
      return NextResponse.json(
        { error: "Department is required to create a profile" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(department.trim())) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    if (!role || role.trim() === "") {
      return NextResponse.json(
        { error: "Role is required to create a profile" },
        { status: 400 }
      );
    }

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const newProfileData: any = {
      userId: new mongoose.Types.ObjectId(userId),
      department: new mongoose.Types.ObjectId(department.trim()),
      role,
      approvalStatus: seekApproval === true ? "pending" : "pending",
    };

    Object.assign(newProfileData, updateData);

    const createdProfile = await FieldStaffProfile.create(newProfileData);
    const populatedProfile = await FieldStaffProfile.findById(
      createdProfile._id
    )
      .populate("department", "name shortCode")
      .lean();

    return NextResponse.json({
      message: seekApproval
        ? "Profile created and approval requested successfully"
        : "Field staff profile created successfully",
      success: true,
      data: populatedProfile,
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
