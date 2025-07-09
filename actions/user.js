"use server";

import mongoose from "mongoose";
import IndustryInsight from "@/models/IndustryInsight.model";
import User from "@/models/User.model";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

// ✅ Function to update user & industry
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Step 1: Find the user
    const user = await User.findOne({ clerkUserId: userId }).session(session);
    if (!user) throw new Error("User not found!");

    // Step 2: Check if industry insight already exists
    let industryInsight = await IndustryInsight.findOne({
      industry: data.industry,
    }).session(session);

    // Step 3: Create industry insight if not found
    if (!industryInsight) {
      const insight = await generateAIInsights(data.industry);

      const created = await IndustryInsight.create(
        [
          {
            industry: data.industry,
            ...insight,
            lastUpdated: new Date (Date.now()),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
          },
        ],
        { session }
      );

      industryInsight = created[0]; // ✅ FIX: extract the first element
    }

    // Step 4: Update user with industry reference and other fields
    user.industry = industryInsight._id;
    user.experience = data.experience;
    user.bio = data.bio;
    user.skills = data.skills;

    const updatedUser = await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      user: JSON.parse(JSON.stringify(updatedUser)),
      industryInsight: JSON.parse(JSON.stringify(industryInsight)),
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

// ✅ Function to get onboarding status
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkUserId: userId }).populate("industry");

  console.log("👤 USER =>", user);
  console.log("🏭 INDUSTRY =>", user?.industry);

  if (!user) throw new Error("User not found");

  return {
    isOnboarded: Boolean(user.industry && user.industry._id),
  };
}
