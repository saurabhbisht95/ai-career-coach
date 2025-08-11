import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    name: { type: String },
    imageUrl: { type: String },
    industry: { type: mongoose.Schema.Types.ObjectId, ref: "IndustryInsight" }, // FK
    bio: { type: String },
    experience: { type: Number },
    skills: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
