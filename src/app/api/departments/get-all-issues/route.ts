import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";
import Department from "@/models/department.model";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    // Assuming session.user has a departmentId field
    // If not, you'll need to fetch the user's department from FieldStaffProfile
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

    if (!departmentId) {
      return NextResponse.json(
        { error: "User is not associated with any department" },
        { status: 400 }
      );
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build query with filters
    const query: any = {
      "assignedTo.department": departmentId,
    };

    // Apply filters
    if (searchParams.has("status")) {
      query.status = searchParams.get("status");
    }
    if (searchParams.has("category")) {
      query.category = searchParams.get("category");
    }
    if (searchParams.has("priority")) {
      query.priority = searchParams.get("priority");
    }

    // Get total count and issues with pagination
    const [issues, totalIssues] = await Promise.all([
      Issue.find(query)
        .select(
          "_id title description category priority status location address createdAt updatedAt assignedTo media socialStats"
        )
        .populate("reporterId", "fullName email profilePicture")
        .populate("assignedTo.staffId", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query),
    ]);

    // Get statistics from all issues (not just paginated)
    const allIssues = await Issue.find(query).select("status priority").lean();

    const stats = {
      total: totalIssues,
      byStatus: {
        reported: allIssues.filter((i: any) => i.status === "reported").length,
        assigned: allIssues.filter((i: any) => i.status === "assigned").length,
        in_progress: allIssues.filter((i: any) => i.status === "in_progress")
          .length,
        resolved: allIssues.filter((i: any) => i.status === "resolved").length,
        rejected: allIssues.filter((i: any) => i.status === "rejected").length,
        reopened: allIssues.filter((i: any) => i.status === "reopened").length,
      },
      byPriority: {
        low: allIssues.filter((i: any) => i.priority === "low").length,
        medium: allIssues.filter((i: any) => i.priority === "medium").length,
        high: allIssues.filter((i: any) => i.priority === "high").length,
        critical: allIssues.filter((i: any) => i.priority === "critical")
          .length,
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
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
