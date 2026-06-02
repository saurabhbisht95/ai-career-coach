import { getDashboardData } from "@/actions/dashboard";
import { redirect } from "next/navigation";
import React from "react";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {
  const { isOnboarded, insights } = await getDashboardData();

  if (!isOnboarded) redirect("/onboarding");

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
};

export default IndustryInsightsPage;
