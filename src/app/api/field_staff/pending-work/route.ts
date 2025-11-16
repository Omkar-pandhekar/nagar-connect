import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Verify user is an approved field staff member
    const fieldStaffProfile = await FieldStaffProfile.findOne({
      userId: userId,
      approvalStatus: "approved",
    }).lean();

    if (!fieldStaffProfile) {
      return NextResponse.json(
        { error: "User is not an approved field staff member" },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Get pending work (assigned and in_progress issues)
    const query: any = {
      "assignedTo.staffId": userId,
      status: { $in: ["assigned", "in_progress"] },
    };

    // Apply additional filters
    if (searchParams.has("priority")) {
      query.priority = searchParams.get("priority");
    }
    if (searchParams.has("category")) {
      query.category = searchParams.get("category");
    }

    // Get issues with pagination
    const [issues, totalIssues] = await Promise.all([
      Issue.find(query)
        .select(
          "_id title description category priority status location address createdAt updatedAt assignedTo statusReview"
        )
        .populate("reporterId", "fullName email profilePicture")
        .populate("assignedTo.department", "name shortCode")
        .sort({ priority: -1, createdAt: -1 }) // Sort by priority first, then date
        .skip(skip)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query),
    ]);

    // Get statistics
    const stats = {
      total: totalIssues,
      assigned: issues.filter((i: any) => i.status === "assigned").length,
      inProgress: issues.filter((i: any) => i.status === "in_progress").length,
      byPriority: {
        low: issues.filter((i: any) => i.priority === "low").length,
        medium: issues.filter((i: any) => i.priority === "medium").length,
        high: issues.filter((i: any) => i.priority === "high").length,
        critical: issues.filter((i: any) => i.priority === "critical").length,
      },
    };

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        total: totalIssues,
        page,
        limit,
        totalPages: Math.ceil(totalIssues / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get pending work error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
