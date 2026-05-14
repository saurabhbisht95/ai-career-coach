import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "./mogodb";
import User from "@/models/User.model";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // Connect to DB
    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({ clerkUserId: user.id });

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const newUser = await User.create({
      clerkUserId: user.id,
      name,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    });

    return newUser;
  } catch (error) {
    console.error("❌ Error checking/creating user:", error.message);
    return null;
  }
};
