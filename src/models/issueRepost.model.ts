import mongoose, { model, models, Schema } from "mongoose";

export interface IIssueRepost {
  _id?: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  caption?: string; // Optional comment when reposting
  createdAt?: Date;
  updatedAt?: Date;
}

const issueRepostSchema = new Schema<IIssueRepost>(
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
    caption: {
      type: String,
      maxlength: [200, "Repost caption cannot exceed 200 characters"],
    },
  },
  { timestamps: true }
);

// Compound index to track reposts
issueRepostSchema.index({ issueId: 1, userId: 1 }, { unique: true });

const IssueRepost =
  models?.issue_reposts ||
  model<IIssueRepost>("issue_reposts", issueRepostSchema);

export default IssueRepost;
