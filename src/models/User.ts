import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;       // undefined for Google OAuth users
  role: "passenger" | "staff" | "admin";
  image?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },   // exclude by default
    role: { type: String, enum: ["passenger", "staff", "admin"], default: "passenger" },
    image: { type: String },
  },
  { timestamps: true }
);

// Re-use the compiled model across hot-reloads
const User = (models.User as mongoose.Model<IUser>) ?? model<IUser>("User", UserSchema);
export default User;
