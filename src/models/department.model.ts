import mongoose, { models, model, Schema } from "mongoose";

export interface IDepartment {
  _id?: mongoose.Types.ObjectId;
  name: string;
  shortCode: string;
  contactEmail?: string;
  contactPhone?: string;
  headId?: mongoose.Types.ObjectId; 
  members?: mongoose.Types.ObjectId[];
  operatingHours?: string;
  slas?: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
    },
    shortCode: {
      type: String,
      required: [true, "Department short code is required"],
      unique: true,
      uppercase: true,
      maxlength: 10,
    },
    contactEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    contactPhone: {
      type: String,
      match: [/^\d{10}$/, "Please fill a valid 10-digit phone number"],
    },
    headId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      sparse: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    operatingHours: String,
    slas: {
      low: { type: Number, min: 0 },
      medium: { type: Number, min: 0 },
      high: { type: Number, min: 0 },
      critical: { type: Number, min: 0 },
    },
  },
  { timestamps: true }
);

const Department =
  models?.departments || model<IDepartment>("departments", departmentSchema);

export default Department;
