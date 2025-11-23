require('dotenv').config();
const mongoose = require('mongoose');
const Interview = require('../../models/Interview');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all completed interviews missing learningResources or where it's null
    const result = await Interview.updateMany(
      {
        status: 'completed',
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
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
