import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import backupRoutes from "./routes/backupRoutes.js"; // ⭐ added routes

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

// test the route
app.get("/", (req, res) => {
  res.send("API running");
});

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});
