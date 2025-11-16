import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import mongoose from "mongoose";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";

export async function POST(
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

    // Verify the issue is assigned to this worker
    const issue = await Issue.findOne({
      _id: issueId,
      "assignedTo.staffId": userId,
    })
      .select("status resolutionDetails")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found or not assigned to you" },
        { status: 404 }
      );
    }

    const currentStatus = (issue as any).status || "in_progress";
    const hasResolutionDetails = !!(issue as any).resolutionDetails;

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET || "nagar_connect"
    );
    cloudinaryFormData.append(
      "folder",
      `nagar-connect/issues/${issueId}/resolution`
    );

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!uploadResponse.ok) {
      console.error("Cloudinary upload failed:", await uploadResponse.text());
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const uploadData = await uploadResponse.json();

    // Determine file type
    const fileType = file.type.startsWith("image/") ? "image" : "video";

    // Build update query based on whether resolutionDetails exists
    const updateQuery: any = {
      $push: {
        timeline: {
          status: currentStatus,
          timestamp: new Date(),
          by: userId,
          notes: `Photo uploaded to resolution media. URL: ${uploadData.secure_url}`,
        },
      },
    };

    if (hasResolutionDetails) {
      // If resolutionDetails exists, just push to the media array
      updateQuery.$push["resolutionDetails.resolutionMedia"] = {
        url: uploadData.secure_url,
        type: fileType,
        thumbnailUrl: uploadData.secure_url,
      };
    } else {
      // If resolutionDetails doesn't exist, initialize it with the first media item
      updateQuery.$set = {
        resolutionDetails: {
          resolvedBy: userId,
          resolvedDate: new Date(),
          resolutionMedia: [
            {
              url: uploadData.secure_url,
              type: fileType,
              thumbnailUrl: uploadData.secure_url,
            },
          ],
        },
      };
    }

    const updatedIssue = await Issue.findByIdAndUpdate(issueId, updateQuery, {
      new: true,
      upsert: false,
    })
      .populate("reporterId", "fullName email profilePicture")
      .populate("assignedTo.staffId", "fullName email")
      .populate("assignedTo.department", "name shortCode")
      .lean();

    if (!updatedIssue) {
      return NextResponse.json(
        { error: "Failed to update issue" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo uploaded successfully",
      data: {
        url: uploadData.secure_url,
        type: fileType,
        thumbnailUrl: uploadData.secure_url,
      },
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
