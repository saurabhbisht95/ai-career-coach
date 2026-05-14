import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import React from "react";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  const insights = await getIndustryInsights();
  // ✅ Convert to plain object to avoid RSC + Turbopack errors
  const safeInsights = JSON.parse(JSON.stringify(insights));

  if (!isOnboarded) redirect("/onboarding");

  return (
    <div className="container mx-auto">
      <DashboardView insights={safeInsights} />
    </div>
  );
};

export default IndustryInsightsPage;
