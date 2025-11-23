import { NextResponse } from "next/server";
import { extractTextFromDocument } from "@/lib/docxExtractor";

export async function POST(req: Request) {
  try {
    console.log("=== PDF TEST ENDPOINT ===");
    
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }
    
    console.log("Testing PDF:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const extractedText = await extractTextFromDocument(file);
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractedLength: extractedText.length,
      extractedText: extractedText.substring(0, 1000), // First 1000 chars
      fullText: extractedText // Full text for debugging
    });
    
  } catch (error) {
    console.error("PDF test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
