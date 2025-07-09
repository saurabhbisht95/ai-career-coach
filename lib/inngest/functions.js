// import IndustryInsight from "@/models/IndustryInsight.model";
// import { inngest } from "./client";
// import { industries } from "@/data/industries";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export const generateIndustryInsights = inngest.createFunction(
//   {
//     name: "Generate Industry Insights",
//   },
//   { cron: "0 0 * * 0" }, // every Sunday at midnight
//   async ({ step }) => {
//     for (const { industry } of industries) {
//       const prompt = `
//         Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
//         {
//           "salaryRanges": [
//             { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
//           ],
//           "growthRate": number,
//           "demandLevel": "high" | "medium" | "low",
//           "topSkills": ["skill1", "skill2"],
//           "marketOutlook": "positive" | "neutral" | "negative",
//           "keyTrends": ["trend1", "trend2"],
//           "recommendedSkills": ["skill1", "skill2"]
//         }

//         IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
//         Include at least 5 common roles for salary ranges.
//         Growth rate should be a percentage.
//         Include at least 5 skills and trends.
//       `;

//       const result = await model.generateContent({
//         contents: [{ role: "user", parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.2,
//         },
//       });

//       const rawText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
//       console.log(`📦 Raw Gemini response for ${industry}:\n`, rawText);

//       const match = rawText.match(/\{[\s\S]*\}/);
//       if (!match) {
//         console.error(`❌ No valid JSON object found for ${industry}`);
//         continue;
//       }

//       const cleaned = match[0].replace(/```json|```/g, "").trim();

//       let insights;
//       try {
//         insights = JSON.parse(cleaned);
//         console.log(`✅ Parsed insights for ${industry}:\n`, insights);
//       } catch (err) {
//         console.error(`❌ JSON parse error for ${industry}:`, err.message);
//         console.error("💩 Raw string:\n", cleaned);
//         continue;
//       }

//       await step.run(`Update ${industry} insights`, async () => {
//         await IndustryInsight.findOneAndUpdate(
//           { industry },
//           {
//             industry,
//             ...insights,
//             lastUpdated: new Date(),
//             nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//           },
//           { upsert: true, new: true }
//         );
//       });
//     }
//   }
// );
