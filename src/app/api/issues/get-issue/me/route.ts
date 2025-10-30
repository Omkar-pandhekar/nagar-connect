import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Base query: only current user's issues
    const query: any = { reporterId: session.user.id };

    // Optional filtering
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Optional geospatial filter
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius"); // meters
    if (lat && lon && radius) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10),
        },
      };
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder as 1 | -1 };

    const issuesQuery = Issue.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("reporterId", "name email")
      .populate("assignedTo.department", "name");

    const [issues, total] = await Promise.all([
      issuesQuery.exec(),
      Issue.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my issues error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
