import mongoose, { models, model, Schema } from "mongoose";

export type UserType = "citizen" | "admin" | "field_staff" | "ngo";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  userType: UserType;
  phoneNumber?: string;
  profilePicture?: string;
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
      enum: ["citizen", "admin", "field_staff", "ngo"],
      required: [true, "Please provide a valid user type!"],
    },
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
  },
  { timestamps: true }
);

const User = models?.users || model<IUser>("users", userSchema);

export default User;
