import mongoose, { models, model, Schema } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  userType: "citizen" | "admin" | "field_staff" | "ngo"; 

  phoneNumber?: string;
  profilePicture?: string; 
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

  employeeId?: string;
  department?: mongoose.Types.ObjectId; 
  role?: "Team Member" | "Supervisor" | "Manager" | "Department Head"; 
  approvalStatus?: "pending" | "approved" | "rejected";

  ngoName?: string; 
  ngoRegistrationNumber?: string; 
  ngoWebsite?: string;
  ngoContactPerson?: string; 
  ngoContactPersonEmail?: string; 
  ngoFocusAreas?: string[]; 
  ngoVerificationStatus?: "pending" | "verified" | "rejected"; 
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a full name"],
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    userType: {
      type: String,
      enum: ["citizen", "admin", "field_staff", "ngo"], // Updated enum
      required: [true, "Please provide a valid user type!"],
    },

    // Core optional contact information
    phoneNumber: {
      type: String,
      match: [/^\d{10}$/, "Please fill a valid 10-digit phone number"],
      unique: true,
      sparse: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/your-cloud-name/image/upload/v1/default_profile_pic.png",
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
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      whatsappNotifications: { type: Boolean, default: true },
    },

    // Fields specific to 'municipal_staff' - use `sparse: true` where not applicable to other types
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "departments",
      sparse: true,
    },
    role: {
      type: String,
      enum: ["Team Member", "Supervisor", "Manager", "Department Head"],
      sparse: true,
    },
    approvalStatus: {
      // For municipal staff
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      sparse: true,
    },

    // New fields specific to 'ngo' - use `sparse: true`
    ngoName: {
      type: String,
      sparse: true,
      unique: true, // NGO name should be unique
    },
    ngoRegistrationNumber: {
      type: String,
      sparse: true,
      unique: true, // Registration number should be unique
    },
    ngoWebsite: {
      type: String,
      sparse: true,
      match: [
        /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i,
        "Please enter a valid website URL",
      ],
    },
    ngoContactPerson: {
      // Primary contact within the NGO
      type: String,
      sparse: true,
    },
    ngoContactPersonEmail: {
      type: String,
      sparse: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    ngoFocusAreas: {
      type: [String], // Array of strings
      sparse: true,
    },
    ngoVerificationStatus: {
      // Similar to staff approval
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      sparse: true,
    },
  },
  { timestamps: true }
);

const User = models?.users || model<IUser>("users", userSchema);

export default User;
