import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
}

const postSchema = new Schema<IPost>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", postSchema);
