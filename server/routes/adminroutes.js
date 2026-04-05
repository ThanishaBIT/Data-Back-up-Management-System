import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import bcrypt from "bcryptjs";
import Backup from "../models/Backup.js";
import fs from "fs";
import path from "path";

const router = express.Router();

/* ==============================
   🔹 SEARCH + VIEW USERS (FIXED)
================================ */
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";

    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ==============================
   🔹 ADD USER (FIXED)
================================ */
router.post("/add-user", protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User added successfully", user });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Add user failed" });
  }
});

/* ==============================
   🔹 DELETE USER
================================ */
router.delete("/user/:id", protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id === userId) {
      return res.status(400).json({ message: "Admin cannot delete himself" });
    }

    const files = await Backup.find({ userId });

    for (let file of files) {
      const filePath = path.join(process.cwd(), file.filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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
   🔹 VIEW ALL FILES
================================ */
router.get("/files", protect, isAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";

    const files = await Backup.find()
      .populate("userId", "name email");

    const filtered = files.filter((file) => {
      return (
        file.fileName?.toLowerCase().includes(search.toLowerCase()) ||
        file.issuer?.toLowerCase().includes(search.toLowerCase()) ||
        file.category?.toLowerCase().includes(search.toLowerCase()) ||
        file.userId?.name?.toLowerCase().includes(search.toLowerCase())
      );
    });

    res.json(filtered);

  } catch (error) {
    res.status(500).json({ message: "Error fetching files" });
  }
});
/* ==============================
   🔹 DELETE FILE
================================ */
router.delete("/file/:id", protect, isAdmin, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(process.cwd(), file.filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Backup.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "File delete failed" });
  }
});

/* ==============================
   🔹 DOWNLOAD FILE (FIXED)
================================ */
router.get("/download/:id", protect, isAdmin, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(process.cwd(), file.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.sendFile(filePath);

  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
});

/* ==============================
   🔹 APPROVE CERTIFICATE
================================ */
router.put("/approve/:id", protect, isAdmin, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    file.status = "approved";
    await file.save();

    res.json({ message: "Approved" });

  } catch (error) {
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ==============================
   🔹 REJECT CERTIFICATE
================================ */
router.put("/reject/:id", protect, isAdmin, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    file.status = "rejected";
    await file.save();

    res.json({ message: "Rejected" });

  } catch (error) {
    res.status(500).json({ message: "Rejection failed" });
  }
});
//satats
router.get("/stats", protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalActiveFiles = await Backup.countDocuments({ isDeleted: false });

    const totalDeletedFiles = await Backup.countDocuments({ isDeleted: true });

    const files = await Backup.find();

    let totalStorage = 0;

    files.forEach(file => {
      totalStorage += file.fileSize || 0; // size in bytes
    });

    const totalStorageUsedMB = (totalStorage / (1024 * 1024)).toFixed(2);

    res.json({
      totalUsers,
      totalActiveFiles,
      totalDeletedFiles,
      totalStorageUsedMB
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Stats error" });
  }
});
export default router;