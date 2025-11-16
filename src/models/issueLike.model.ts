import mongoose, { models, model, Schema } from "mongoose";

export interface IIssueLike {
  _id?: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  active: boolean; // Track if like is active (for unlike/re-like)
  createdAt?: Date;
  updatedAt?: Date;
}

const issueLikeSchema = new Schema<IIssueLike>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "issues",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one like per user per issue
issueLikeSchema.index({ issueId: 1, userId: 1 }, { unique: true });

const IssueLike =
  models?.issue_likes || model<IIssueLike>("issue_likes", issueLikeSchema);

export default IssueLike;
