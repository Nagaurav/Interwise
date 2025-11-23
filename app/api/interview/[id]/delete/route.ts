import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import { getUserIdFromToken } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get token from authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user id from token
    const userId = getUserIdFromToken(token);
    const interviewId = params.id;

    if (!interviewId) {
      return NextResponse.json(
        { message: "Interview ID is required" },
        { status: 400 }
      );
    }

    // Find the interview and verify ownership
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    // Check if the interview belongs to the authenticated user
    if (interview.user.toString() !== userId) {
      return NextResponse.json(
        { message: "Unauthorized to delete this interview" },
        { status: 403 }
      );
    }

    // Delete the interview
    await Interview.findByIdAndDelete(interviewId);

    console.log(`Interview ${interviewId} deleted by user ${userId}`);

    return NextResponse.json(
      { 
        message: "Interview deleted successfully",
        deletedInterviewId: interviewId
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error deleting interview:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: "Invalid interview ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
