import express from "express";
import { registerUser, loginUser, changeMyPassword } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


// 🔹 Profile Route (ADD THIS)
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});


// 🔐 User change own password
router.put("/change-password", protect, changeMyPassword);

export default router;