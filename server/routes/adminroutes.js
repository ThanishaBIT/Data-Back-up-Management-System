import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import bcrypt from "bcryptjs";
import Backup from "../models/Backup.js";
import fs from "fs";

const router = express.Router();

/* ==============================
   🔹 View All Users
================================ */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ==============================
   🔹 View All Files
================================ */
router.get("/files", protect, isAdmin, async (req, res) => {
  try {
    const files = await Backup.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Error fetching files" });
  }
});

/* ==============================
   🔹 Delete User
================================ */
router.delete("/user/:id", protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id === userId) {
      return res.status(400).json({ message: "Admin cannot delete himself" });
    }

    const files = await Backup.find({ userId });

    for (let file of files) {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    }

    await Backup.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ==============================
   🔹 Delete File
================================ */
router.delete("/file/:id", protect, isAdmin, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await Backup.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "File delete failed" });
  }
});

/* ==============================
   🔹 Secure Download
================================ */
router.get("/download/:id", protect, isAdmin, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.download(file.filePath);

  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
});

/* ==============================
   🔹 Advanced Admin Stats
================================ */
router.get("/stats", protect, isAdmin, async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();
    const totalActiveFiles = await Backup.countDocuments({ isDeleted: false });
    const totalDeletedFiles = await Backup.countDocuments({ isDeleted: true });

    const storage = await Backup.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$fileSize" } } }
    ]);

    const totalStorageUsed = storage[0]?.total || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filesToday = await Backup.countDocuments({
      uploadDate: { $gte: today }
    });

    const activeUser = await Backup.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let mostActiveUser = null;

    if (activeUser.length > 0) {
      const user = await User.findById(activeUser[0]._id);
      mostActiveUser = user?.email;
    }

    res.json({
      totalUsers,
      totalActiveFiles,
      totalDeletedFiles,
      totalStorageUsedMB: (totalStorageUsed / (1024 * 1024)).toFixed(2),
      filesToday,
      mostActiveUser
    });

  } catch (error) {
    res.status(500).json({ message: "Stats fetch failed" });
  }
});

export default router;