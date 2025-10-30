import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const userId = session.user.id;
    const reporterObjectId = new mongoose.Types.ObjectId(userId);

    const [countsByStatus, countsByCategory, countsByPriority, totalCount, recentIssues] = await Promise.all([
      Issue.aggregate([
        { $match: { reporterId: reporterObjectId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { reporterId: reporterObjectId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { reporterId: reporterObjectId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Issue.countDocuments({ reporterId: reporterObjectId }),
      Issue.find({ reporterId: reporterObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status priority category address media createdAt updatedAt")
        .lean(),
    ]);

    const toMap = (arr: Array<{ _id: string; count: number }>) =>
      arr.reduce((acc, cur) => {
        acc[cur._id || "Unknown"] = cur.count;
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      overview: {
        totals: {
          all: totalCount,
          ...toMap(countsByStatus),
        },
        byCategory: toMap(countsByCategory),
        byPriority: toMap(countsByPriority),
        recent: recentIssues,
      },
    });
  } catch (error) {
    console.error("Overview fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
