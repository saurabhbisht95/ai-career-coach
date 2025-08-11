"use server";

import { auth } from "@clerk/nextjs/server";
import User from "@/models/User.model";
import Resume from "@/models/Resume.model";
import { revalidatePath } from "next/cache";
import "@/models/IndustryInsight.model";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});


export async function saveResume(content) {
 const { userId } = await auth(); // ✅ correct way to get logged-in user on server

 
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId });
  
  if (!user) throw new Error("User not found");

  try {
    const resume = await Resume.updateOne(
      { userId: user._id },
      { $set: { content } },
      { upsert: true }
    );
    
    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error.message);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({
    clerkUserId: userId,
  });

  if (!user) throw new Error("user not found");

  return await Resume.findOne({ userId: user.id }).populate("userId");
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({
    clerkUserId: userId,
  }).populate("industry");

  if (!user) throw new Error("user not found");

   const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improveContent = await response.text().trim();

    return improveContent;
  } catch (error) {
    console.error("Error improving content:", error.message)
    throw new Error("Failed to improve content")
  }

}
