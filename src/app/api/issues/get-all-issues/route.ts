import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import IssueLike from "@/models/issueLike.model";
import IssueRepost from "@/models/issueRepost.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Get current user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build the query object dynamically
    const query: any = {};

    // Filtering by status, category, or priority
    if (searchParams.has("status")) {
      query.status = searchParams.get("status");
    }
    if (searchParams.has("category")) {
      query.category = searchParams.get("category");
    }
    if (searchParams.has("priority")) {
      query.priority = searchParams.get("priority");
    }

    // Geospatial filtering (find issues within a certain radius)
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius"); // in meters

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
    const sortBy = searchParams.get("sortBy") || "createdAt"; // Default sort by creation date
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1; // Default to descending
    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder as 1 | -1,
    };

    // Execute query to get issues and total count
    const issuesQuery = Issue.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      // Populate related data to avoid sending just IDs
      .populate("reporterId", "fullName name email profilePicture") // Get user info
      .populate("assignedTo.department", "name"); // Get department name

    const [issues, totalIssues] = await Promise.all([
      issuesQuery.exec(),
      Issue.countDocuments(query),
    ]);

    // If user is logged in, add their like/repost status to each issue
    let issuesWithUserStatus = issues;

    if (userId) {
      issuesWithUserStatus = await Promise.all(
        issues.map(async (issue) => {
          const issueObj = issue.toObject();

          // Check if user has liked this issue
          const userLike = await IssueLike.findOne({
            issueId: issue._id,
            userId: userId,
            active: true,
          });

          // Check if user has reposted this issue
          const userRepost = await IssueRepost.findOne({
            issueId: issue._id,
            userId: userId,
          });

          return {
            ...issueObj,
            userLiked: !!userLike,
            userReposted: !!userRepost,
          };
        })
      );
    } else {
      // If not logged in, set both to false
      issuesWithUserStatus = issues.map((issue) => ({
        ...issue.toObject(),
        userLiked: false,
        userReposted: false,
      }));
    }

    // Send a structured response with pagination metadata
    return NextResponse.json({
      success: true,
      data: issuesWithUserStatus,
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
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
