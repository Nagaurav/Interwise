import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add the project root to the module path
const projectRoot = path.resolve(__dirname, '../../../');

// Import using dynamic import with the correct path
const { connectDB } = await import(path.join(projectRoot, 'lib/mongodb.js'));
const { default: Interview } = await import(path.join(projectRoot, 'models/Interview.js'));

async function migrate() {
  try {
    await connectDB();
    
    // Find all interviews that are completed but missing learningResources
    const result = await Interview.updateMany(
      {
        status: "completed",
        $or: [
          { 'feedback.learningResources': { $exists: false } },
          { 'feedback.learningResources': null }
        ]
      },
      {
        $set: { 'feedback.learningResources': {} }
      }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} interviews.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
