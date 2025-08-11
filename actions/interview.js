"use server";

import Assessment from "@/models/Assessment.model";
import User from "@/models/User.model";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import IndustryInsight from "@/models/IndustryInsight.model";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

export async function generateQuiz() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({
    clerkUserId: userId,
  }).populate("industry");

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = await response.text();

    // Extract JSON part
    const match = rawText.match(/\{[\s\S]*\}/); // matches first {...} block
    if (!match) {
      throw new Error("No valid JSON object found in Gemini response");
    }

    const cleanedText = match[0];
    const parsed = JSON.parse(cleanedText); // safe now
    
    return parsed.questions;
  } catch (error) {
    console.error("Gemini JSON parsing failed:", error.message);
    throw new Error("Failed to generate quiz questions.");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({
    clerkUserId: userId,
  }).populate("industry");

  if (!user) throw new Error("User not found");

  const questionsResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.answer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionsResults.filter((q) => !q.isCorrect);

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const result = await model.generateContent(improvementPrompt);
      const response = result.response;
      improvementTip = await response.text().trim();
    } catch (error) {
      console.error("Error generating the improvement tip:", error.message);
      throw new Error("Failed to generate quiz questions.");
    }
  }

  try {
    const resultToInsert = {
      userId: user.id,
      quizScore: score,
      questions: questionsResults,
      category: "Technical",
      improvementTip,
    };
    const assessment = await Assessment.create(resultToInsert);
    return JSON.parse(JSON.stringify(assessment));
  } catch (error) {
    console.error("Error saving assessment:", error.message);
    throw new Error("Failed to save quiz result.");
  }
}


export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await User.findOne({
    clerkUserId: userId
  });

  if (!user) throw new Error("User not found");

  try {
    const assessmentsRaw = await Assessment.find({
       userId: user.id 
    }).sort({createdAt: -1}).lean();
    const assessments = JSON.parse(JSON.stringify(assessmentsRaw));

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}


// "use server";

// import Assessment from "@/models/Assessment.model";
// import User from "@/models/User.model";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import IndustryInsight from "@/models/IndustryInsight.model";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash-latest",
// });

// export async function generateQuiz() {
//   const { userId } = await auth();

//   if (!userId) throw new Error("Unauthorized");

//   const user = await User.findOne({ clerkUserId: userId }).populate("industry");

//   if (!user) throw new Error("User not found");

//   const prompt = `
//     Generate 3 technical interview questions for a ${user.industry.industry} professional${
//     user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
//   }.
    
//     Each question should be multiple choice with 4 options.
    
//     Return the response in this JSON format only, no additional text:
//     {
//       "questions": [
//         {
//           "question": "string",
//           "options": ["string", "string", "string", "string"],
//           "correctAnswer": "string",
//           "explanation": "string"
//         }
//       ]
//     }
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = result.response;
//     const rawText = await response.text();

//     const match = rawText.match(/\{[\s\S]*\}/);
//     if (!match) throw new Error("No valid JSON object found in Gemini response");

//     const parsed = JSON.parse(match[0]);
//     return parsed.questions;
//   } catch (error) {
//     console.error("Gemini JSON parsing failed:", error.message);
//     throw new Error("Failed to generate quiz questions.");
//   }
// }

// export async function saveQuizResult(questions, answers, score) {
//   const { userId } = await auth();

//   if (!userId) throw new Error("Unauthorized");

//   const user = await User.findOne({ clerkUserId: userId }).populate("industry");

//   if (!user) throw new Error("User not found");

//   const questionsResults = questions.map((q, index) => ({
//     question: q.question,
//     answer: q.correctAnswer, // <-- FIXED: previously was q.answer which was undefined
//     userAnswer: answers[index],
//     isCorrect: q.correctAnswer === answers[index],
//     explanation: q.explanation,
//   }));

//   const wrongAnswers = questionsResults.filter((q) => !q.isCorrect);

//   let improvementTip = null;

//   if (wrongAnswers.length > 0) {
//     const wrongQuestionsText = wrongAnswers
//       .map(
//         (q) =>
//           `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
//       )
//       .join("\n\n");

//     const improvementPrompt = `
//       The user got the following ${user.industry.industry} technical interview questions wrong:

//       ${wrongQuestionsText}

//       Based on these mistakes, provide a concise, specific improvement tip.
//       Focus on the knowledge gaps revealed by these wrong answers.
//       Keep the response under 2 sentences and make it encouraging.
//     `;

//     try {
//       const result = await model.generateContent(improvementPrompt);
//       const response = result.response;
//       improvementTip = await response.text().trim();
//     } catch (error) {
//       console.error("Error generating the improvement tip:", error.message);
//     }
//   }

//   try {
//     const resultToInsert = {
//       userId: user.id,
//       quizScore: score,
//       questions: questionsResults,
//       category: "Technical",
//       improvementTip,
//     };

//     const assessment = await Assessment.create(resultToInsert);

//     // ✅ Return a plain object to avoid serialization issues
//     return JSON.parse(JSON.stringify(assessment));
//   } catch (error) {
//     console.error("Error saving assessment:", error.message);
//     throw new Error("Failed to save quiz result.");
//   }
// }

// export async function getAssessments() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await User.findOne({ clerkUserId: userId });

//   if (!user) throw new Error("User not found");

//   try {
//     const assessments = await Assessment.find({ userId: user.id }) // ✅ FIXED: use `userId`, not `clerkUserId`
//       .sort({ createdAt: -1 }) // sort newest first
//       .lean(); // ✅ makes result plain JS object for client components

//     return assessments;
//   } catch (error) {
//     console.error("Error fetching assessments:", error.message);
//     throw new Error("Failed to fetch assessments.");
//   }
// }
