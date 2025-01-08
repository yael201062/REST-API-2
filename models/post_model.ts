import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  sender: mongoose.Types.ObjectId;
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model<IPost>('Post', PostSchema);