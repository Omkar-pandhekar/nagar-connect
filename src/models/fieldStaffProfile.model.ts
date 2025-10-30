import mongoose, { models, model, Schema } from "mongoose";

export interface IFieldStaffProfile {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; 
  employeeId: string; 
  department: mongoose.Types.ObjectId; 
  role: "Team Member" | "Supervisor" | "Manager" | "Department Head"; 
  address?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  approvalStatus: "pending" | "approved" | "rejected"; 

  createdAt?: Date;
  updatedAt?: Date;
}

const fieldStaffProfileSchema = new Schema<IFieldStaffProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required for municipal staff"],
      unique: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "departments",
      required: [true, "Department is required for municipal staff"],
    },
    role: {
      type: String,
      enum: ["Team Member", "Supervisor", "Manager", "Department Head"],
      required: [true, "Role is required for municipal staff"],
    },
    address: {
      street: String,
      city: String,
      pincode: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        index: "2dsphere",
        sparse: true,
      },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

const FieldStaffProfile =
  models?.field_staff_profiles ||
  model<IFieldStaffProfile>("field_staff_profiles", fieldStaffProfileSchema);

export default FieldStaffProfile;
