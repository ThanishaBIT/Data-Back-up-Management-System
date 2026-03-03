// server/utils/cleanupJob.js

import cron from "node-cron";
import Backup from "../models/Backup.js";
import fs from "fs";

// Runs daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running 5-day cleanup job...");

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const filesToDelete = await Backup.find({
    isDeleted: true,
    deletedAt: { $lte: fiveDaysAgo }
  });

  for (let file of filesToDelete) {
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }

      await Backup.findByIdAndDelete(file._id);

      console.log("Deleted permanently:", file.fileName);
    } catch (err) {
      console.log("Error deleting:", file.fileName);
    }
  }

  console.log("Cleanup completed.");
});