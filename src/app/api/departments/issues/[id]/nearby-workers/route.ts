import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { id } = await params;

    // Validate issueId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid issue ID format" },
        { status: 400 }
      );
    }

    const issueId = new mongoose.Types.ObjectId(id);

    // Get user's department
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const departmentAsHead = await Department.findOne({ headId: userId })
      .select("_id")
      .lean();

    if (
      !departmentAsHead ||
      Array.isArray(departmentAsHead) ||
      !departmentAsHead._id
    ) {
      return NextResponse.json(
        { error: "User is not authorized" },
        { status: 403 }
      );
    }

    const departmentId =
      typeof departmentAsHead._id === "string"
        ? new mongoose.Types.ObjectId(departmentAsHead._id)
        : (departmentAsHead._id as mongoose.Types.ObjectId);

    // Get issue location
    const issue = await Issue.findOne({
      _id: issueId,
      "assignedTo.department": departmentId,
    })
      .select("location")
      .lean();

    if (!issue || Array.isArray(issue) || !issue.location?.coordinates) {
      return NextResponse.json(
        { error: "Issue not found or has no location data" },
        { status: 404 }
      );
    }

    const [issueLon, issueLat] = issue.location.coordinates;

    // Get all approved workers from the department with location data
    const workers = await FieldStaffProfile.find({
      department: departmentId,
      approvalStatus: "approved",
      location: { $exists: true, $ne: null }, // Only workers with location data
    })
      .populate("userId", "fullName email profilePicture")
      .select("userId employeeId role location department approvalStatus")
      .lean();

    // Calculate distance for each worker using their actual location
    const workersWithDistance = workers
      .map((worker) => {
        if (!worker.location?.coordinates) {
          return null; // Skip workers without location
        }

        const [workerLon, workerLat] = worker.location.coordinates;
        const distance = calculateDistance(
          issueLat,
          issueLon,
          workerLat,
          workerLon
        );

        return {
          ...worker,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      })
      .filter((worker) => worker !== null) as Array<
      (typeof workers)[0] & { distance: number }
    >;

    // Sort by distance (closest first)
    workersWithDistance.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      data: workersWithDistance,
    });
  } catch (error) {
    console.error("Get nearby workers error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
