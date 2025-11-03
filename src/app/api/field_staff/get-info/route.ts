import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import User from "@/models/user.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
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

    // Find field staff profile by userId (not email)
    const fieldStaffProfile = await FieldStaffProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("department", "name shortCode")
      .lean();

    if (!fieldStaffProfile) {
      return NextResponse.json(
        { error: "Field staff profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Field staff profile fetched successfully",
      success: true,
      data: fieldStaffProfile,
    });
  } catch (error) {
    console.error("Field Staff Fetch API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
