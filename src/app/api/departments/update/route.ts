import { ConnectDB } from "@/db/dbConfig";
import Department from "@/models/department.model";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(request: NextRequest) {
  try {
    await ConnectDB();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const reqBody = await request.json();

    const {
      name,
      shortCode,
      contactEmail,
      contactPhone,
      operatingHours,
      slas,
    } = reqBody;

    // Validate required fields
    if (!name || !shortCode) {
      return NextResponse.json(
        { error: "Name and short code are required" },
        { status: 400 }
      );
    }

    // Validate short code length
    if (shortCode.length > 10) {
      return NextResponse.json(
        { error: "Short code must be 10 characters or less" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (contactEmail) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(contactEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Validate phone format if provided
    if (contactPhone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(contactPhone)) {
        return NextResponse.json(
          { error: "Phone number must be 10 digits" },
          { status: 400 }
        );
      }
    }

    // Validate SLAs if provided
    if (slas) {
      const slaFields = ["low", "medium", "high", "critical"];
      for (const field of slaFields) {
        if (slas[field] !== undefined) {
          const value = Number(slas[field]);
          if (isNaN(value) || value < 0) {
            return NextResponse.json(
              { error: `SLA ${field} must be a non-negative number` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Check if department already exists for this user
    let department = await Department.findOne({ headId: userId });

    if (department) {
      // Update existing department
      // Check if name or shortCode conflicts with other departments
      const nameConflict = await Department.findOne({
        name: name.trim(),
        _id: { $ne: department._id },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Department name already exists" },
          { status: 400 }
        );
      }

      const shortCodeConflict = await Department.findOne({
        shortCode: shortCode.trim().toUpperCase(),
        _id: { $ne: department._id },
      });

      if (shortCodeConflict) {
        return NextResponse.json(
          { error: "Department short code already exists" },
          { status: 400 }
        );
      }

      // Update department
      department.name = name.trim();
      department.shortCode = shortCode.trim().toUpperCase();
      department.contactEmail = contactEmail?.trim() || undefined;
      department.contactPhone = contactPhone?.trim() || undefined;
      department.operatingHours = operatingHours?.trim() || undefined;
      department.headId = userId;

      if (slas) {
        department.slas = {
          low: slas.low !== undefined ? Number(slas.low) : undefined,
          medium: slas.medium !== undefined ? Number(slas.medium) : undefined,
          high: slas.high !== undefined ? Number(slas.high) : undefined,
          critical: slas.critical !== undefined ? Number(slas.critical) : undefined,
        };
      }

      await department.save();
    } else {
      // Create new department
      // Check if name or shortCode already exists
      const nameExists = await Department.findOne({
        name: name.trim(),
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Department name already exists" },
          { status: 400 }
        );
      }

      const shortCodeExists = await Department.findOne({
        shortCode: shortCode.trim().toUpperCase(),
      });

      if (shortCodeExists) {
        return NextResponse.json(
          { error: "Department short code already exists" },
          { status: 400 }
        );
      }

      // Create new department
      department = new Department({
        name: name.trim(),
        shortCode: shortCode.trim().toUpperCase(),
        contactEmail: contactEmail?.trim() || undefined,
        contactPhone: contactPhone?.trim() || undefined,
        operatingHours: operatingHours?.trim() || undefined,
        headId: userId,
        members: [],
        slas: slas
          ? {
              low: slas.low !== undefined ? Number(slas.low) : undefined,
              medium: slas.medium !== undefined ? Number(slas.medium) : undefined,
              high: slas.high !== undefined ? Number(slas.high) : undefined,
              critical: slas.critical !== undefined ? Number(slas.critical) : undefined,
            }
          : undefined,
      });

      await department.save();
    }

    // Return updated/created department
    const updatedDepartment = await Department.findById(department._id).lean();

    return NextResponse.json({
      success: true,
      message: department._id ? "Department updated successfully" : "Department created successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Department update error:", error);

    // Handle duplicate key error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      const field = Object.keys((error as any).keyPattern || {})[0];
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}




