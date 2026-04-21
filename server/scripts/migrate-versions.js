/**
 * One-time migration: lift Resume content fields into ResumeVersion documents.
 *
 * For each legacy Resume doc that lacks a headVersionId:
 *   1. Creates a ResumeVersion (v1, source: 'upload') from the Resume's own fields
 *   2. Sets Resume.headVersionId → new version
 *   3. Backfills Application.resumeVersionId for any applications tied to that resume
 *
 * Safe to re-run — already-migrated resumes (headVersionId set) are skipped.
 *
 * Usage:
 *   node server/scripts/migrate-versions.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Use raw collection access so we see the legacy fields that are no longer in
  // the Mongoose schema (s3Key, originalFileName, thumbnailS3Key, extractedText, keywords).
  const resumesCol = mongoose.connection.db.collection('resumes');
  const versionsCol = mongoose.connection.db.collection('resumeversions');
  const applicationsCol = mongoose.connection.db.collection('applications');

  const rawResumes = await resumesCol.find({}).toArray();
  console.log(`Found ${rawResumes.length} resume(s) to inspect`);

  let migrated = 0;
  for (const raw of rawResumes) {
    if (raw.headVersionId) {
      console.log(`  [skip] ${raw._id} — already migrated`);
      continue;
    }

    // Create a ResumeVersion from the legacy Resume fields
    const versionDoc = {
      resumeId: raw._id,
      userId: raw.userId,
      versionNumber: 1,
      commitMessage: 'Initial upload',
      s3Key: raw.s3Key || null,
      originalFileName: raw.originalFileName || null,
      thumbnailS3Key: raw.thumbnailS3Key || null,
      extractedText: raw.extractedText || '',
      keywords: raw.keywords || [],
      parentVersionId: null,
      source: 'upload',
      createdAt: raw.createdAt || new Date(),
      updatedAt: raw.updatedAt || new Date(),
    };

    const insertResult = await versionsCol.insertOne(versionDoc);
    const versionId = insertResult.insertedId;

    // Point the Resume at its new head version
    await resumesCol.updateOne(
      { _id: raw._id },
      { $set: { headVersionId: versionId } }
    );

    // Backfill applications that reference this resume but have no version snapshot
    const { modifiedCount } = await applicationsCol.updateMany(
      { resumeId: raw._id, resumeVersionId: { $exists: false } },
      { $set: { resumeVersionId: versionId } }
    );

    console.log(
      `  [migrated] resume ${raw._id} → version ${versionId} (v1); backfilled ${modifiedCount} application(s)`
    );
    migrated++;
  }

  console.log(`\nDone. ${migrated} resume(s) migrated.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
