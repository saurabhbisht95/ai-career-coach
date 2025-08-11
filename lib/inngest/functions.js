// lib/inngest/functions.js
import IndustryInsight from "@/models/IndustryInsight.model";
import { inngest } from "./client";
import { industries } from "@/data/industries";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Every Sunday at midnight
  async ({ step }) => {
    for (const { industry } of industries) {
      // Skip if no existing record
      const existing = await IndustryInsight.findOne({ industry });
      if (!existing) {
        console.warn(`⏩ Skipping ${industry}, no existing insight found`);
        continue;
      }

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

        IMPORTANT: Return ONLY the JSON. No extra text or formatting.
        At least 5 salary ranges, skills, and trends. Growth rate must be %.
      `;

      const result = await model.generateContent(prompt);
      const rawText = await result.response.text();

      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error(`❌ No valid JSON for ${industry}`);
        continue;
      }

      let insights;
      try {
        insights = JSON.parse(match[0]);
      } catch (err) {
        console.error(`❌ Failed to parse JSON for ${industry}:`, err.message);
        continue;
      }

      await step.run(`Update ${industry}`, async () => {
        await IndustryInsight.findOneAndUpdate(
          { industry },
          {
            $set: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          }
        );
      });
    }
  }
);
