import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name?: string;
  password?: string; 
  avatar?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default model<IUser>("User", userSchema);