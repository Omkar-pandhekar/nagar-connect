import { ConnectDB } from "@/db/dbConfig";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const departments = await Department.find({})
      .select("_id name shortCode")
      .lean();

    return NextResponse.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Departments Fetch API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
