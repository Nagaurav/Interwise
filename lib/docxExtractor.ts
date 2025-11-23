import mammoth from 'mammoth';

export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    if (!file) {
      console.warn("No Word document provided");
      return "";
    }

    // Check if it's a Word document
    const isWordDoc = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                      file.name.toLowerCase().endsWith('.docx');
    
    if (!isWordDoc) {
      console.warn("File is not a Word document:", file.type);
      return "";
    }

    console.log(`Starting Word document extraction for: ${file.name} (${Math.round(file.size / 1024)} KB)`);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Extract text using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      console.warn("No text content found in Word document");
      return `Word document processed: ${file.name} - No readable text content found`;
    }

    // Log any conversion messages/warnings
    if (result.messages && result.messages.length > 0) {
      console.log("Word extraction messages:", result.messages);
    }

    console.log(`✅ Word extraction successful: ${result.value.length} characters extracted`);
    console.log("Word text preview:", result.value.substring(0, 300));
    
    // Clean up the extracted text
    const cleanedText = result.value
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    return cleanedText;
  } catch (error) {
    console.error("Error extracting text from Word document:", error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    // Return a fallback message instead of empty string
    return `Word document received: ${file.name} (${Math.round(file.size / 1024)} KB) - Processing failed, please try again or use paste option`;
  }
};

// Enhanced extractor that handles both PDF and Word documents
export const extractTextFromDocument = async (file: File): Promise<string> => {
  try {
    const fileName = file.name.toLowerCase().trim();
    const fileType = file.type.toLowerCase().trim();
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    console.log(`Document extraction started for: ${file.name}`, {
      originalType: file.type,
      detectedType: fileType,
      fileName,
      size: file.size,
      extension: fileExtension
    });

    // Check file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (5MB)`);
    }

    // Determine file type based on both MIME type and file extension
    const isPDF = fileType === 'application/pdf' || fileExtension === 'pdf';
    const isWord = fileType.includes('word') || 
                  fileType.includes('officedocument.wordprocessingml') || 
                  fileExtension === 'docx';

    // Try to extract text based on detected type
    if (isPDF) {
      try {
        console.log('Detected PDF document, extracting text...');
        const { extractTextFromPDF } = await import('./pdfExtractor');
        const text = await extractTextFromPDF(file);
        if (!text || text.trim().length === 0) {
          throw new Error('PDF extraction returned empty content');
        }
        return text;
      } catch (pdfError) {
        console.error('PDF extraction failed, trying alternative methods:', pdfError);
        throw new Error(`Failed to extract text from PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }
    } 
    else if (isWord) {
      try {
        console.log('Detected Word document, extracting text...');
        const text = await extractTextFromDocx(file);
        if (!text || text.trim().length === 0) {
          throw new Error('Word document extraction returned empty content');
        }
        return text;
      } catch (docxError) {
        console.error('Word document extraction failed:', docxError);
        throw new Error(`Failed to extract text from Word document: ${docxError instanceof Error ? docxError.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during document processing';
    console.error('Document extraction error:', {
      fileName: file.name,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide detailed error information in development
    const detailedError = process.env.NODE_ENV === 'development' 
      ? ` (${errorMessage})` 
      : '';
      
    return `Document processing failed: ${file.name}${detailedError}. Please try again or use the text input option.`;
  }
};
