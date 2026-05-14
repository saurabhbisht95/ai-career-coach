import mongoose from "mongoose";

const IndustryInsightSchema = new mongoose.Schema(
  {
    industry: { type: String, unique: true, required: true },
    salaryRanges: [{ type: Object }], // JSON[]
    growthRate: { type: Number },
    demandLevel: { type: String, enum: ["high", "medium", "low"] },
    topSkills: [{ type: String }],
    marketOutlook: { type: String, enum: ["positive", "neutral", "negative"] },
    keyTrends: [{ type: String }],
    recommendedSkills: [{ type: String }],
    lastUpdated: { type: Date },
    nextUpdate: { type: Date },
  },
  { timestamps: false }
);

export default mongoose.models.IndustryInsight ||
  mongoose.model("IndustryInsight", IndustryInsightSchema);
