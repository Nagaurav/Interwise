declare module 'mammoth' {
  interface ConversionMessage {
    type: string;
    message: string;
  }

  interface ConversionResult {
    value: string;
    messages: ConversionMessage[];
  }

  interface DocumentSource {
    arrayBuffer: ArrayBuffer;
  }

  function extractRawText(source: DocumentSource): Promise<ConversionResult>;
  
  export { extractRawText };
}
