
import { getAssessments } from "@/actions/interview";
import React from "react";
import StatsCards from "./_components/stats-card";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";

const Interviewpage = async() => {

  const assessments = await getAssessments()
  return (
    <div>
      <div>
        <h1 className="text-6xl font-bold gradient-title mb-5">
          Interview Preparation
        </h1>
        
        <div>
          <StatsCards assessments ={assessments} /> 
          <PerformanceChart assessments ={assessments} /> 
          <QuizList assessments ={assessments} /> 
        </div>
      </div>
    </div>
  );
};

export default Interviewpage;
