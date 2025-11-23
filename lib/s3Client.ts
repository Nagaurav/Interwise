export async function uploadToS3(
  fileBuffer: Buffer,
  key: string,
  contentType: string
) {
  throw new Error("Recording uploads are disabled.");
}
