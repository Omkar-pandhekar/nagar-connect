import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";
import Department from "@/models/department.model";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function getDepartmentFromAI(
  title: string,
  description: string,
  category: string,
  availableDepartments: Array<{ name: string; shortCode: string }>
): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an intelligent issue routing system for a civic complaint platform. 
Your task is to analyze the issue and determine which department should handle it.

Issue Details:
- Title: ${title}
- Description: ${description}
- Category: ${category}

Available Departments:
${availableDepartments.map((d) => `- ${d.name} (${d.shortCode})`).join("\n")}

Based on the issue details, determine the MOST APPROPRIATE department to handle this complaint.
Respond with ONLY the department shortCode (e.g., "ELEC", "PWD", "SWM").
If no department is a good match, respond with "GENERAL".

Response (shortCode only):`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();

    // Validate that the response matches one of the available departments
    const matchedDept = availableDepartments.find(
      (d) => d.shortCode.toUpperCase() === response
    );

    return matchedDept ? matchedDept.shortCode : null;
  } catch (error) {
    console.error("AI department assignment error:", error);
    return null; // Fallback to no assignment
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();
    const {
      title,
      description,
      location: locationInput,
      category: categoryInput,
      priority: priorityInput,
      attachments,
    } = reqBody;

    // Validate required fields
    if (!title || !description || !locationInput || !categoryInput) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (title, description, location, category)",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await ConnectDB();

    // Normalize category to match schema enum
    const categoryMap: Record<string, string> = {
      pothole: "Pothole",
      streetlight: "Streetlight",
      garbage: "Garbage",
      water: "Water Leak",
      road: "Road Damage",
      drainage: "Drainage",
      encroachment: "Encroachment",
      other: "Other",
      traffic: "Other",
    };
    const category =
      categoryMap[(categoryInput || "").toLowerCase()] || "Other";

    // Normalize priority
    const priorityMap: Record<string, "low" | "medium" | "high" | "critical"> =
      {
        low: "low",
        medium: "medium",
        high: "high",
        urgent: "critical",
        critical: "critical",
      };
    const priority =
      priorityMap[(priorityInput || "medium").toLowerCase()] || "medium";

    // Geocode the address
    const address = String(locationInput).trim();
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${accessToken}&limit=1`;

    const geoRes = await fetch(mapboxUrl);
    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Failed to geocode address" },
        { status: 400 }
      );
    }

    const geoData: { features: Array<{ center: [number, number] }> } =
      await geoRes.json();
    if (!geoData.features?.length) {
      return NextResponse.json(
        { error: "Could not find coordinates for the provided address" },
        { status: 400 }
      );
    }

    const [lon, lat] = geoData.features[0].center;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json(
        { error: "Invalid coordinates received from geocoding service" },
        { status: 400 }
      );
    }

    // Build media array
    const media = Array.isArray(attachments)
      ? attachments
          .filter((a: any) => a?.url)
          .map((a: any) => {
            const url: string = a.url;
            const lower = url.toLowerCase();
            let type: "image" | "video" | "audio" = "image";
            if (/(\.mp4|\.mov|\.webm|video)/.test(lower)) type = "video";
            else if (/(\.mp3|\.wav|audio)/.test(lower)) type = "audio";
            else type = "image";
            return { url, type };
          })
      : [];

    // ========== AI-POWERED DEPARTMENT ASSIGNMENT ==========

    // Fetch all available departments
    const departments = await Department.find(
      {},
      { name: 1, shortCode: 1, _id: 1 }
    );

    let assignedDepartment = null;
    let assignedDepartmentId = null;

    if (departments.length > 0) {
      // Use AI to determine the best department
      const deptShortCode = await getDepartmentFromAI(
        title,
        description,
        category,
        departments.map((d) => ({ name: d.name, shortCode: d.shortCode }))
      );

      if (deptShortCode) {
        assignedDepartment = departments.find(
          (d) => d.shortCode.toUpperCase() === deptShortCode.toUpperCase()
        );
        assignedDepartmentId = assignedDepartment?._id;
      }
    }

    // Create timeline with assignment if department was found
    const timeline = [
      {
        status: "reported",
        timestamp: new Date(),
        by: session.user?.id,
        notes: "Issue reported by user",
      },
    ];

    if (assignedDepartmentId) {
      timeline.push({
        status: "assigned",
        timestamp: new Date(),
        by: session.user?.id,
        notes: `Auto-assigned to ${assignedDepartment?.name}`,
      });
    }

    // Create new issue with assignment
    const newIssue = new Issue({
      reporterId: session.user?.id,
      title,
      description,
      category,
      priority,
      status: assignedDepartmentId ? "assigned" : "reported",
      location: { type: "Point", coordinates: [lon, lat] },
      address,
      media,
      assignedTo: assignedDepartmentId
        ? {
            department: assignedDepartmentId,
            assignedDate: new Date(),
          }
        : undefined,
      timeline,
    });

    const savedIssue = await newIssue.save();

    return NextResponse.json({
      success: true,
      message: assignedDepartmentId
        ? `Issue reported and assigned to ${assignedDepartment?.name}`
        : "Issue reported successfully",
      issue: {
        id: savedIssue._id,
        title: savedIssue.title,
        status: savedIssue.status,
        assignedTo: assignedDepartmentId
          ? {
              department: assignedDepartment?.name,
              shortCode: assignedDepartment?.shortCode,
            }
          : null,
        createdAt: savedIssue.createdAt,
      },
    });
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
