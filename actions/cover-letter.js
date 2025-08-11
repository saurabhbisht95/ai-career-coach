"use server";

import CoverLetter from "@/models/CoverLetter.model";
import User from "@/models/User.model";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper to make Mongo/Mongoose documents serializable
function toPlain(obj) {
  if (!obj) return null;
  return {
    ...obj,
    _id: obj._id?.toString(),
    userId: obj.userId?.toString(),
    createdAt: obj.createdAt?.toISOString?.(),
    updatedAt: obj.updatedAt?.toISOString?.(),
  };
}

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId }).populate("industry");
  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${user.industry.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const coverLetter = await CoverLetter.create({
      content,
      jobDescription: data.jobDescription,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status: "completed",
      userId: user._id, // store ObjectId reference
    });

    return toPlain(coverLetter.toObject());
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");

  const letters = await CoverLetter.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return letters.map(toPlain);
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");

  const letter = await CoverLetter.findOne({ _id: id, userId: user._id }).lean();
  return toPlain(letter);
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");

  return await CoverLetter.deleteOne({ _id: id, userId: user._id });
}
