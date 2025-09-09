import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  displayName: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export default mongoose.model<IUser>("User", UserSchema);
