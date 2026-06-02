import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    jobDescription: { type: String },
    companyName: { type: String },
    jobTitle: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

CoverLetterSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.CoverLetter || mongoose.model("CoverLetter", CoverLetterSchema);
