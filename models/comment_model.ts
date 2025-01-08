import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>("Comment", commentSchema);
