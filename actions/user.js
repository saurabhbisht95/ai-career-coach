"use server";

import mongoose from "mongoose";
import IndustryInsight from "@/models/IndustryInsight.model";
import User from "@/models/User.model";
import { auth } from "@clerk/nextjs/server";

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

    // Step 2: Find existing industry insight
    let industryInsight = await IndustryInsight.findOne({
      industry: data.industry,
    }).session(session);

    // Step 3: Create industry if not found
    if (!industryInsight) {
      const created = await IndustryInsight.create(
        [
          {
            industry: data.industry,
            salaryRanges: [],
            growthRate: 0,
            demandLevel: "medium",
            topSkills: [],
            marketOutlook: "neutral",
            keyTrends: [],
            recommendedSkills: [],
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
        { session }
      );

      industryInsight = created[0];
    }

    // Step 4: Update user with ObjectId reference
    user.industry = industryInsight._id;
    user.experience = data.experience;
    user.bio = data.bio;
    user.skills = data.skills;

    const updatedUser = await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { success: true, user: updatedUser, industryInsight };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile" + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    // Populate the `industry` ObjectId to get full doc
    const user = await User.findOne({ clerkUserId: userId }).populate("industry");

    if (!user) throw new Error("User not found");

    return {
      isOnboarded: !!user.industry, // Checks if reference is set
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error.message);
    throw new Error("Failed to check onboarding status");
  }
}
