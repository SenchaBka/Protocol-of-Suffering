import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default model<IUser>("User", userSchema);