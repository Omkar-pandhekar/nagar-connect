import { ConnectDB } from "@/db/dbConfig";
import User from "@/models/user.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

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
    const { fullName, phoneNumber, profilePicture, password } = reqBody;

    // Find the user
    const findUser = await User.findOne({ email: userEmail });

    if (!findUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update object
    const updateData: any = {};

    // Update fields if provided
    if (fullName !== undefined && fullName.trim() !== "") {
      if (fullName.length < 2) {
        return NextResponse.json(
          { error: "Full name must be at least 2 characters" },
          { status: 400 }
        );
      }
      if (fullName.length > 100) {
        return NextResponse.json(
          { error: "Full name cannot exceed 100 characters" },
          { status: 400 }
        );
      }
      updateData.fullName = fullName.trim();
    }

    if (phoneNumber !== undefined) {
      if (phoneNumber.trim() === "") {
        updateData.phoneNumber = undefined;
      } else {
        if (!/^\d{10}$/.test(phoneNumber.trim())) {
          return NextResponse.json(
            { error: "Please fill a valid 10-digit phone number" },
            { status: 400 }
          );
        }
        // Check if phone number is already taken by another user
        const existingUserWithPhone = await User.findOne({
          phoneNumber: phoneNumber.trim(),
          _id: { $ne: findUser._id },
        });
        if (existingUserWithPhone) {
          return NextResponse.json(
            { error: "Phone number is already taken" },
            { status: 400 }
          );
        }
        updateData.phoneNumber = phoneNumber.trim();
      }
    }

    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }

    // Handle password update
    if (password !== undefined && password.trim() !== "") {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      // Hash the new password
      const salt = await bcryptjs.genSalt(10);
      updateData.passwordHash = await bcryptjs.hash(password, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Remove passwordHash from response
    const userResponse = updatedUser.toObject();
    delete userResponse.passwordHash;

    return NextResponse.json({
      message: "User updated successfully",
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("User Update API error:", error);

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
