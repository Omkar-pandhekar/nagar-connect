import { ConnectDB } from "@/db/dbConfig";
import User from "@/models/user.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

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

    const findUser = await User.findOne({ email: userEmail });

    if (!findUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User role fetched successfully",
      success: true,
      data: findUser,
    });
  } catch (error) {
    console.error("User Fetch API error:", error);
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
