import mongoose, { models, model, Schema } from "mongoose";

export interface IIssue {
  _id?: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId; 
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  status:
    | "reported"
    | "acknowledged"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "rejected"
    | "reopened";
  priority: "low" | "medium" | "high" | "critical";
  location: {
    type: "Point";
    coordinates: [number, number]; 
  };
  address: string;
  media: Array<{
    url: string;
    type: "image" | "video" | "audio";
    thumbnailUrl?: string;
  }>;
  assignedTo?: {
    department: mongoose.Types.ObjectId; 
    staffId?: mongoose.Types.ObjectId; 
    assignedDate?: Date;
  };
  resolutionDetails?: {
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedDate?: Date;
    resolutionSummary?: string;
    resolutionMedia?: Array<{
      url: string;
      type: "image" | "video";
      thumbnailUrl?: string;
    }>;
  };
  timeline: Array<{
    status: string;
    timestamp: Date;
    by?: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  feedback?: {
    rating?: number; // 1-5
    comment?: string;
    timestamp?: Date;
  };
  expectedResolutionDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Issue title is required"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Issue description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      enum: [
        "Pothole",
        "Streetlight",
        "Garbage",
        "Water Leak",
        "Road Damage",
        "Drainage",
        "Encroachment",
        "Other",
      ],
      required: [true, "Issue category is required"],
      index: true,
    },
    subCategory: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "reported",
        "acknowledged",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
        "reopened",
      ],
      default: "reported",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], 
        required: true,
        index: "2dsphere",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required for the issue location"],
    },
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video", "audio"],
          required: true,
        },
        thumbnailUrl: String,
      },
    ],
    assignedTo: {
      department: {
        type: Schema.Types.ObjectId,
        ref: "departments",
        index: true,
      },
      staffId: { type: Schema.Types.ObjectId, ref: "users" }, 
      assignedDate: Date,
    },
    resolutionDetails: {
      resolvedBy: { type: Schema.Types.ObjectId, ref: "users" }, 
      resolvedDate: Date,
      resolutionSummary: String,
      resolutionMedia: [
        {
          url: { type: String, required: true },
          type: { type: String, enum: ["image", "video"], required: true },
          thumbnailUrl: String,
        },
      ],
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "users" },
        notes: String,
      },
    ],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      timestamp: Date,
    },
    expectedResolutionDate: Date,
  },
  { timestamps: true }
);

const Issue = models?.issues || model<IIssue>("issues", issueSchema);

export default Issue;
