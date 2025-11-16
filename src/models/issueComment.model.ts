import mongoose, { model, models, Schema } from "mongoose";

export interface IIssueComment {
  _id?: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  parentCommentId?: mongoose.Types.ObjectId; // For nested replies
  likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked this comment
  createdAt?: Date;
  updatedAt?: Date;
}

const issueCommentSchema = new Schema<IIssueComment>(
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
    text: {
      type: String,
      required: [true, "Comment text is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "issue_comments",
      default: null,
      index: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

const IssueComment =
  models?.issue_comments ||
  model<IIssueComment>("issue_comments", issueCommentSchema);

export default IssueComment;
