import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test Gemini API connection
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        status: "no_api_key",
        message: "Gemini API key not configured",
      });
    }

    // Test with a simple text request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                  text: "Say 'Hello' if you can read this.",
                },
              ],
            },
          ],
        }),
      }
    );

    console.log(response)

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        status: "api_error",
        message: `Gemini API error: ${response.status}`,
        error: errorText,
      });
    }

    const data = await response.json();

    return NextResponse.json({
      status: "success",
      message: "Gemini API is working",
      response: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

