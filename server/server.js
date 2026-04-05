import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import backupRoutes from "./routes/backupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminroutes from "./routes/adminroutes.js";
import "./utils/cleanupJob.js";

dotenv.config();

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Only expose verified files
app.use("/uploads/backup", express.static("uploads/backup"));

// Routes
app.use("/api/files", backupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminroutes);


// Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// File size error handling
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 10MB allowed." });
  }
  next(err);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// delete after two days in admin 

setInterval(async () => {
  try {
    const now = new Date();

    const files = await Backup.find({
      isDeleted: true,
      deletedAt: { $ne: null }
    });

    for (let file of files) {
      const diff = (now - file.deletedAt) / (1000 * 60 * 60 * 24);

      if (diff >= 2) { // 🔥 2 days
        const filePath = path.join(process.cwd(), file.filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await Backup.findByIdAndDelete(file._id);

        console.log("Auto deleted:", file.fileName);
      }
    }

  } catch (err) {
    console.log("Auto delete error:", err);
  }
}, 60 * 60 * 1000); // runs every 1 hour
