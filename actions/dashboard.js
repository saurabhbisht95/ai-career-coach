"use server";

import User from "@/models/User.model";
import IndustryInsight from "@/models/IndustryInsight.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "high" | "medium" | "low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "positive" | "neutral" | "negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = await response.text();

    // Extract JSON part
    const match = rawText.match(/\{[\s\S]*\}/); // matches first {...} block
    if (!match) {
      throw new Error("No valid JSON object found in Gemini response");
    }

    const cleanedText = match[0];
    const parsed = JSON.parse(cleanedText); // safe now

    return parsed;
  } catch (error) {
    console.error("Gemini JSON parsing failed:", error.message);
    throw new Error("Gemini returned invalid JSON.");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId }).populate("industry");

  if (!user) throw new Error("User not found");
  if (!user.industry || !user.industry.industry) {
    console.warn("⚠️ User has no industry selected");
    throw new Error("User has no industry selected");
  }

  const industryName = user.industry.industry;

  let industryInsight = await IndustryInsight.findOne({
    industry: industryName,
  });

  if (!industryInsight) {

    const insight = await generateAIInsights(industryName);

    // Add log before creation
    const documentToInsert = {
      industry: industryName,
      ...insight,
      lastUpdated: new Date (Date.now()),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    
    industryInsight = await IndustryInsight.create(documentToInsert);

  }

  return industryInsight;
}
