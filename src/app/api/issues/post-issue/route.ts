import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/db/dbConfig";
import Issue from "@/models/issue.model";

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
      location: locationInput, // human readable address from client
      category: categoryInput,
      priority: priorityInput,
      attachments,
    } = reqBody;

    // Validate required fields (address will be derived from locationInput)
    if (!title || !description || !locationInput || !categoryInput) {
      return NextResponse.json(
        { error: "Missing required fields (title, description, location, category)" },
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
      traffic: "Other", // not present in schema, fallback
    };
    const category = categoryMap[(categoryInput || "").toLowerCase()] || "Other";

    // Normalize priority to match schema enum
    const priorityMap: Record<string, "low" | "medium" | "high" | "critical"> = {
      low: "low",
      medium: "medium",
      high: "high",
      urgent: "critical",
      critical: "critical",
    };
    const priority = priorityMap[(priorityInput || "medium").toLowerCase()] || "medium";

    // Forward geocode the provided address to lat/lon using OpenStreetMap Nominatim


  const address = String(locationInput).trim();

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${accessToken}&limit=1`;

    const geoRes = await fetch(mapboxUrl);

  if (!geoRes.ok) {
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 400 });
  }

  const geoData: { features: Array<{ center: [number, number] }> } = await geoRes.json();

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

    // Build media array from attachments if any (optional field)
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

    // Create new issue aligned with schema
    const newIssue = new Issue({
      reporterId: session.user?.id,
      title,
      description,
      category,
      priority,
      status: "reported",
      location: { type: "Point", coordinates: [lon, lat] },
      address,
      media,
    });

    const savedIssue = await newIssue.save();

    return NextResponse.json({
      success: true,
      message: "Issue reported successfully",
      issue: {
        id: savedIssue._id,
        title: savedIssue.title,
        status: savedIssue.status,
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
