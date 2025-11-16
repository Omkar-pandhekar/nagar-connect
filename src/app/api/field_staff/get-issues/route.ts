import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Get the field staff profile to verify the worker
    const fieldStaffProfile = await FieldStaffProfile.findOne({
      userId: userId,
      approvalStatus: "approved",
    })
      .select("_id department")
      .lean();

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

    // Build query to get issues assigned to this worker
    const query: any = {
      "assignedTo.staffId": userId,
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
          "_id title description category priority status location address createdAt updatedAt assignedTo media socialStats resolutionDetails statusReview"
        )
        .populate("reporterId", "fullName email profilePicture")
        .populate("assignedTo.staffId", "fullName email")
        .populate("assignedTo.department", "name shortCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query),
    ]);

    // Manually populate statusReview.requestedBy for issues that have it
    // Since nested populate can be problematic, we do it manually
    const User = (await import("@/models/user.model")).default;
    const populatedIssues = await Promise.all(
      (issues as any[]).map(async (issue) => {
        if (issue.statusReview?.requestedBy) {
          try {
            const user = await User.findById(issue.statusReview.requestedBy)
              .select("fullName email")
              .lean();
            if (user) {
              issue.statusReview.requestedBy = user;
            }
          } catch (err) {
            // If populate fails, keep the original ObjectId value
            console.error("Error populating statusReview.requestedBy:", err);
          }
        }
        return issue;
      })
    );

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
        acknowledged: allIssues.filter((i: any) => i.status === "acknowledged")
          .length,
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
      data: populatedIssues,
      pagination: {
        total: totalIssues,
        page,
        limit,
        totalPages: Math.ceil(totalIssues / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get issues error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
