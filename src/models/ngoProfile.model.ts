import mongoose, { models, model, Schema } from "mongoose";

export interface INGOProfile {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; 
  ngoName: string; 
  ngoRegistrationNumber: string; 
  ngoWebsite?: string;
  ngoContactPerson?: string;
  ngoContactPersonEmail?: string; 
  ngoFocusAreas?: string[]; 
  ngoVerificationStatus: "pending" | "verified" | "rejected"; 
  address?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
  };

  createdAt?: Date;
  updatedAt?: Date;
}

const ngoProfileSchema = new Schema<INGOProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    ngoName: {
      type: String,
      required: [true, "NGO name is required"],
      unique: true,
    },
    ngoRegistrationNumber: {
      type: String,
      required: [true, "NGO registration number is required"],
      unique: true,
    },
    ngoWebsite: {
      type: String,
      match: [
        /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i,
        "Please enter a valid website URL",
      ],
      sparse: true,
    },
    ngoContactPerson: {
      type: String,
      sparse: true,
    },
    ngoContactPersonEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      sparse: true,
    },
    ngoFocusAreas: {
      type: [String],
      sparse: true,
    },
    ngoVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      required: true,
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
  },
  { timestamps: true }
);

const NGOProfile =
  models?.ngo_profiles || model<INGOProfile>("ngo_profiles", ngoProfileSchema);

export default NGOProfile;
