import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema(
  {
    quizScore: { type: Number, required: true },
    questions: [{ type: Object }], // array of JSON
    category: { type: String, required: true },
    improvementTip: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // foreign key
  },
  { timestamps: true }
);

export default mongoose.models.Assessment || mongoose.model("Assessment", AssessmentSchema);
