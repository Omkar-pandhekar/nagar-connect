import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build the query object dynamically
    const query: any = {};

    // Filtering by status, category, or priority
    if (searchParams.has('status')) {
      query.status = searchParams.get('status');
    }
    if (searchParams.has('category')) {
      query.category = searchParams.get('category');
    }
    if (searchParams.has('priority')) {
      query.priority = searchParams.get('priority');
    }
    
    // Geospatial filtering (find issues within a certain radius)
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius'); // in meters

    if (lat && lon && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius, 10),
        },
      };
    }

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // Default sort by creation date
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1; // Default to descending
    const sortOptions = { [sortBy]: sortOrder };

    // 2. Execute query to get issues and total count
    const issuesQuery = Issue.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      // Populate related data to avoid sending just IDs
      .populate('reporterId', 'name email') // Get name and email from the User model
      .populate('assignedTo.department', 'name'); // Get name from the Department model

    const [issues, totalIssues] = await Promise.all([
      issuesQuery.exec(),
      Issue.countDocuments(query),
    ]);

    // 3. Send a structured response with pagination metadata
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
    console.error("Get issues error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}