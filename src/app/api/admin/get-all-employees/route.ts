import { ConnectDB } from "@/db/dbConfig";
import FieldStaffProfile from "@/models/fieldStaffProfile.model";
import Department from "@/models/department.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const employees = await FieldStaffProfile.find({})
      .select("_id employeeId department role approvalStatus")
      .populate("department", "name shortCode")
      .populate("userId", "fullName email")
      .lean();

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
