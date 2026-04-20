import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import connectDB from "./config/db.js";
import backupRoutes from "./routes/backupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminroutes from "./routes/adminroutes.js";
import Backup from "./models/Backup.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ FIXED STATIC (IMPORTANT)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/files", backupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminroutes);

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});