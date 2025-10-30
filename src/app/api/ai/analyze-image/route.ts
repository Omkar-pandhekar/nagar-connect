import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";

// Issue type mapping based on AI analysis
const ISSUE_TYPE_MAPPING = {
  // Infrastructure issues
  pothole: ["pothole", "hole", "crack", "road damage", "asphalt", "pavement"],
  streetlight: [
    "streetlight",
    "lamp post",
    "light pole",
    "street lamp",
    "lighting",
  ],
  road: ["road damage", "pavement", "asphalt", "crack", "bump", "uneven road"],
  traffic: [
    "traffic signal",
    "stop sign",
    "traffic light",
    "signal",
    "traffic",
  ],

  // Utility issues
  water: ["water leak", "flooding", "pipe", "water main", "sewer", "drainage"],
  garbage: ["garbage", "trash", "litter", "waste", "dumpster", "rubbish"],
  drainage: ["drain", "sewer", "flooding", "water", "drainage", "overflow"],

  // Safety issues
  safety: ["broken", "damaged", "hazard", "danger", "unsafe", "emergency"],
  other: ["general", "miscellaneous", "unknown"],
};

// AI-powered image analysis function using Gemini
async function analyzeImageWithAI(imageUrl: string): Promise<{
  category: string;
  confidence: number;
  description: string;
  tags: string[];
}> {
  try {
    // Using Google Gemini API
    if (process.env.GEMINI_API_KEY) {
      return await analyzeWithGemini(imageUrl);
    }

    // Fallback: Basic image analysis using fetch and simple heuristics
    return await analyzeWithFallback(imageUrl);
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      category: "other",
      confidence: 0.1,
      description: "Unable to analyze image",
      tags: [],
    };
  }
}

// Google Gemini API implementation
async function analyzeWithGemini(imageUrl: string) {
  try {
    // Fetch and convert image to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Detect image format
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    // Use the correct Gemini API endpoint (updated for 2024)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Look at this image and categorize it as ONLY ONE of these civic issue types: pothole, streetlight, road, traffic, water, garbage, drainage, safety, other. Respond with just the category name, nothing else.`,
                },
                {
                  inline_data: {
                    mime_type: contentType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      console.error("API Key configured:", !!process.env.GEMINI_API_KEY);
      console.error("API Key length:", process.env.GEMINI_API_KEY?.length || 0);

      // If 404, try fallback
      if (response.status === 404) {
        console.log("Gemini API endpoint not found, using fallback analysis");
        return await analyzeWithFallback(imageUrl);
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates in Gemini response");
    }

    const candidate = data.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error("No content in Gemini response");
    }

    const content = candidate.content.parts[0].text?.trim().toLowerCase() || "";
    console.log("Gemini content:", content);

    // Simple category matching
    let category = "other";
    let confidence = 0.5;

    if (content.includes("pothole") || content.includes("hole")) {
      category = "pothole";
      confidence = 0.8;
    } else if (content.includes("streetlight") || content.includes("light")) {
      category = "streetlight";
      confidence = 0.8;
    } else if (content.includes("road") || content.includes("street")) {
      category = "road";
      confidence = 0.7;
    } else if (content.includes("traffic") || content.includes("signal")) {
      category = "traffic";
      confidence = 0.8;
    } else if (content.includes("water") || content.includes("leak")) {
      category = "water";
      confidence = 0.8;
    } else if (content.includes("garbage") || content.includes("trash")) {
      category = "garbage";
      confidence = 0.8;
    } else if (content.includes("drainage") || content.includes("drain")) {
      category = "drainage";
      confidence = 0.8;
    } else if (content.includes("safety") || content.includes("hazard")) {
      category = "safety";
      confidence = 0.7;
    } else if (content.includes("other")) {
      category = "other";
      confidence = 0.6;
    }

    return {
      category,
      confidence,
      description: `Detected: ${category}`,
      tags: [category],
    };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}

// Fallback analysis using basic image metadata and heuristics
async function analyzeWithFallback(imageUrl: string) {
  try {
    // Basic image analysis based on filename and URL
    const imageName = imageUrl.toLowerCase();

    // Simple keyword matching based on filename and URL
    let category = "other";
    let confidence = 0.3;

    if (imageName.includes("pothole") || imageName.includes("hole")) {
      category = "pothole";
      confidence = 0.6;
    } else if (imageName.includes("light") || imageName.includes("lamp")) {
      category = "streetlight";
      confidence = 0.6;
    } else if (imageName.includes("water") || imageName.includes("leak")) {
      category = "water";
      confidence = 0.6;
    } else if (imageName.includes("garbage") || imageName.includes("trash")) {
      category = "garbage";
      confidence = 0.6;
    } else if (imageName.includes("road") || imageName.includes("street")) {
      category = "road";
      confidence = 0.5;
    }

    return {
      category,
      confidence,
      description: `Fallback: ${category}`,
      tags: [category],
    };
  } catch (error) {
    return {
      category: "other",
      confidence: 0.1,
      description: "Analysis failed",
      tags: [],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Validate image URL
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log("Gemini API key not configured, using fallback");
      const fallbackAnalysis = await analyzeWithFallback(imageUrl);
      return NextResponse.json({
        success: true,
        analysis: {
          suggestedCategory: fallbackAnalysis.category,
          confidence: fallbackAnalysis.confidence,
          description: "Fallback analysis (Gemini API key not configured)",
          tags: fallbackAnalysis.tags,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Analyze image with AI
    const analysis = await analyzeImageWithAI(imageUrl);

    // Return analysis results
    return NextResponse.json({
      success: true,
      analysis: {
        suggestedCategory: analysis.category,
        confidence: analysis.confidence,
        description: analysis.description,
        tags: analysis.tags,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
