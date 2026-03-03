import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import backupRoutes from "./routes/backupRoutes.js"; // ⭐ added routes
import authRoutes from "./routes/authRoutes.js";
import adminroutes from "./routes/adminroutes.js";
import "./utils/cleanupJob.js";

// load the environment variable
dotenv.config();

// initial app
const app = express();

// connect mongodb
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ⭐ connect backup routes
app.use("/uploads", express.static("uploads"));

app.use("/api/files", backupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminroutes);

// test the route
app.get("/", (req, res) => {
  res.send("API running");
});
//to handle the error message if the file size is large 
 app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 10MB allowed." });
  }
  next(err);
});
// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});
