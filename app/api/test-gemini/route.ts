import { NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    console.log("=== GEMINI TEST ENDPOINT ===");
    
    const { resumeText, jobRole, techStack } = await req.json();
    
    // Create test context similar to the real one
    const context = `
    Job Role: ${jobRole || "Software Developer"}
    Tech Stack: ${Array.isArray(techStack) ? techStack.join(", ") : "JavaScript, React, Node.js"}
    Years of Experience: 3
    
    Resume/Candidate Information:
    ${resumeText || 'No resume information provided. Generate general questions based on the job role and tech stack.'}
    
    Instructions for generating questions:
    1. First 3 questions should be soft-skill questions (behavioral, problem-solving, teamwork)
    2. Next 7 questions should be technical questions based on the candidate's experience and tech stack
    3. Include 2 more soft-skill questions (communication, leadership, etc.)
    4. Final 3 questions should be more advanced technical questions
    5. If resume information is provided, tailor the questions to the candidate's specific experience and skills
    6. If no resume is provided, generate questions based on the job role and tech stack
    `;
    
    console.log("Test context length:", context.length);
    console.log("Resume text length:", resumeText ? resumeText.length : 0);
    
    const questions = await generateInterviewQuestions(context);
    
    return NextResponse.json({
      success: true,
      contextLength: context.length,
      resumeLength: resumeText ? resumeText.length : 0,
      questionsGenerated: questions.length,
      questions: questions,
      context: context.substring(0, 500) + "..." // Preview of context
    });
    
  } catch (error) {
    console.error("Gemini test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
