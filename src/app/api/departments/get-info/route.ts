import { ConnectDB } from "@/db/dbConfig";
import Department from "@/models/department.model";
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
      return NextResponse.json({
        success: true,
        data: null,
        message: "No department found for this user",
      });
    }

    return NextResponse.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department info error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}


