"use server";
import connectToDatabase from "@/lib/mogodb";
import IndustryInsight from "@/models/IndustryInsight.model";
import User from "@/models/User.model";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

function toPlainUser(user) {
  if (!user) return null;

  return {
    ...user,
    _id: user._id?.toString(),
    industry: user.industry?.toString?.() ?? user.industry,
    createdAt: user.createdAt?.toISOString?.(),
    updatedAt: user.updatedAt?.toISOString?.(),
  };
}

function toPlainIndustryInsight(industryInsight) {
  if (!industryInsight) return null;

  return {
    ...industryInsight,
    _id: industryInsight._id?.toString(),
    lastUpdated: industryInsight.lastUpdated?.toISOString?.() ?? null,
    nextUpdate: industryInsight.nextUpdate?.toISOString?.() ?? null,
  };
}

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  try {
    const user = await User.findOne({ clerkUserId: userId })
      .select("_id")
      .lean();
    if (!user) throw new Error("User not found!");

    let industryInsight = await IndustryInsight.findOne({
      industry: data.industry,
    }).lean();

    if (!industryInsight) {
      const insight = await generateAIInsights(data.industry);

      industryInsight = await IndustryInsight.findOneAndUpdate(
        { industry: data.industry },
        {
          $setOnInsert: {
            industry: data.industry,
            ...insight,
            lastUpdated: new Date(Date.now()),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          industry: industryInsight._id,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      },
      { new: true }
    )
      .select("clerkUserId email name imageUrl industry bio experience skills createdAt updatedAt")
      .lean();

    return {
      success: true,
      user: toPlainUser(updatedUser),
      industryInsight: toPlainIndustryInsight(industryInsight),
    };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const user = await User.findOne({ clerkUserId: userId })
    .select("industry")
    .lean();

  if (!user) throw new Error("User not found");

  return {
    isOnboarded: Boolean(user.industry),
  };
}
