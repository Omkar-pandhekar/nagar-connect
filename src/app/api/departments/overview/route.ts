import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import Department from "@/models/department.model";
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

    // Verify user is a department head
    const department = await Department.findOne({ headId: userId })
      .select("_id name shortCode contactEmail contactPhone")
      .lean();

    if (!department || Array.isArray(department)) {
      return NextResponse.json(
        { error: "User is not a department head" },
        { status: 403 }
      );
    }

    const departmentId =
      typeof department._id === "string"
        ? new mongoose.Types.ObjectId(department._id)
        : (department._id as mongoose.Types.ObjectId);

    // Query for all issues assigned to this department
    const query = {
      "assignedTo.department": departmentId,
    };

    // Get comprehensive statistics
    const [
      totalIssues,
      unassignedIssues,
      pendingReviewIssues,
      resolvedIssues,
      inProgressIssues,
      assignedIssues,
      reportedIssues,
      issuesByStatus,
      issuesByPriority,
      issuesByCategory,
      recentIssues,
      totalWorkers,
      approvedWorkers,
      pendingWorkers,
    ] = await Promise.all([
      Issue.countDocuments(query),
      Issue.countDocuments({
        ...query,
        status: { $in: ["reported", "acknowledged"] },
        "assignedTo.staffId": { $exists: false },
      }),
      Issue.countDocuments({
        ...query,
        "statusReview.reviewStatus": "pending",
        "statusReview.requestedStatus": "resolved",
      }),
      Issue.countDocuments({ ...query, status: "resolved" }),
      Issue.countDocuments({ ...query, status: "in_progress" }),
      Issue.countDocuments({ ...query, status: "assigned" }),
      Issue.countDocuments({ ...query, status: "reported" }),
      Issue.aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: query },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: query },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      Issue.find(query)
        .select("_id title status priority category createdAt assignedTo")
        .populate("assignedTo.staffId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      FieldStaffProfile.countDocuments({
        department: departmentId,
      }),
      FieldStaffProfile.countDocuments({
        department: departmentId,
        approvalStatus: "approved",
      }),
      FieldStaffProfile.countDocuments({
        department: departmentId,
        approvalStatus: "pending",
      }),
    ]);

    // Convert aggregates to objects
    const statusMap = issuesByStatus.reduce((acc: any, item: any) => {
      acc[item._id || "unknown"] = item.count;
      return acc;
    }, {});

    const priorityMap = issuesByPriority.reduce((acc: any, item: any) => {
      acc[item._id || "unknown"] = item.count;
      return acc;
    }, {});

    const categoryMap = issuesByCategory.reduce((acc: any, item: any) => {
      acc[item._id || "unknown"] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        department,
        stats: {
          total: totalIssues,
          unassigned: unassignedIssues,
          pendingReview: pendingReviewIssues,
          resolved: resolvedIssues,
          inProgress: inProgressIssues,
          assigned: assignedIssues,
          reported: reportedIssues,
        },
        workers: {
          total: totalWorkers,
          approved: approvedWorkers,
          pending: pendingWorkers,
        },
        byStatus: statusMap,
        byPriority: priorityMap,
        byCategory: categoryMap,
        recentIssues,
      },
    });
  } catch (error) {
    console.error("Get department overview error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
