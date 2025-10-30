import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    // Get the user ID from the session
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // 2. Get URL search parameters for pagination and sorting
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // 3. Build the query to find issues specifically for this user
    const query = { reporterId: userId };

    // 4. Execute the query
    const issuesQuery = Issue.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('assignedTo.department', 'name'); // Populate department name

    const [issues, totalIssues] = await Promise.all([
      issuesQuery.exec(),
      Issue.countDocuments(query),
    ]);

    // 5. Return the structured response
    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        total: totalIssues,
        page,
        limit,
        totalPages: Math.ceil(totalIssues / limit),
      },
    });

  } catch (error) {
    console.error("Get user's issues error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}