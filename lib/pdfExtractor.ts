export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    if (!file) {
      console.warn("No PDF file provided");
      return "";
    }

    if (!file.type || file.type !== "application/pdf") {
      console.warn("File is not a PDF:", file.type);
      return "";
    }

    console.log(`Starting PDF extraction for: ${file.name} (${Math.round(file.size / 1024)} KB)`);

    // Try to dynamically import pdf-parse to avoid potential issues
    let pdf;
    try {
      pdf = (await import('pdf-parse')).default;
    } catch (importError) {
      console.error("Failed to import pdf-parse:", importError);
      return `PDF file uploaded: ${file.name} (${Math.round(file.size / 1024)} KB) - Text extraction temporarily unavailable`;
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    const data = await pdf(buffer);
    
    console.log("PDF Parse Results:", {
      textLength: data.text ? data.text.length : 0,
      pages: data.numpages,
      version: data.version,
      hasText: !!data.text
    });
    
    if (!data.text || data.text.trim().length === 0) {
      console.warn("No text content found in PDF");
      return `PDF processed: ${file.name} - No readable text content found`;
    }

    // Log first 500 characters of extracted text for debugging
    console.log("First 500 chars of extracted text:", data.text.substring(0, 500));
    
    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    console.log(`✅ PDF extraction successful: ${cleanedText.length} characters after cleaning`);
    console.log("Cleaned text preview:", cleanedText.substring(0, 300));

    return cleanedText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    // Return a fallback message instead of empty string to indicate PDF was processed
    return `PDF file received: ${file.name} (${Math.round(file.size / 1024)} KB) - Please manually enter job details or try again`;
  }
};
