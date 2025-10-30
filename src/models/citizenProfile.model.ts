import mongoose, { models, model, Schema } from "mongoose";

export interface ICitizenProfile {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; 
  address?: {
    street?: string;
    city?: string; 
    pincode?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number]; 
  };
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    whatsappNotifications?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const citizenProfileSchema = new Schema<ICitizenProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true, 
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
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      whatsappNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const CitizenProfile =
  models?.citizen_profiles ||
  model<ICitizenProfile>("citizen_profiles", citizenProfileSchema);

export default CitizenProfile;
