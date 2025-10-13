import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { ConnectDB } from "@/db/dbConfig";
import User from "@/models/user.model";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const reqBody = await request.json();
    const { fname, lname, email, phn, password, confirmPassword, role } =
      reqBody;

    console.log("Registration attempt for:", email);

    if (
      !fname ||
      !lname ||
      !email ||
      !phn ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phn)) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const existingPhone = await User.findOne({ phoneNumber: phn });
    if (existingPhone) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const fullName = `${fname} ${lname}`;

    const userTypeMap: { [key: string]: string } = {
      citizen: "citizen",
      worker: "field_staff",
      ngo: "ngo",
    };

    const userType = userTypeMap[role] || "citizen";

    const newUser = new User({
      fullName,
      email,
      phoneNumber: phn,
      passwordHash: hashedPassword,
      userType,
    });

    const savedUser = await newUser.save();
    console.log("User created successfully:", savedUser.email);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...userWithoutPassword } =
      savedUser.toObject();

    return NextResponse.json({
      message: "User registered successfully",
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
