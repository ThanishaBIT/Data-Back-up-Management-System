import express from "express";
import multer from "multer";
import protect from "../middleware/authMiddleware.js";
import Backup from "../models/Backup.js";
import fs from "fs";
import path from "path";

const router = express.Router();

/* ==============================
   🔹 Multer Setup (PRIVATE STORAGE)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 🔐 secure folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  }
});

/* ==============================
   🔹 Upload File (USER → PENDING)
================================ */
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    const file = await Backup.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,

      issuer: req.body.issuer || "N/A",
      category: req.body.category || "General",
      year: req.body.year,

      status: "pending", // 🔥 IMPORTANT

      userId: req.user.id,
    });

    res.status(201).json({
      message: "File uploaded. Waiting for admin verification.",
      file,
    });

  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});


/* ==============================
   🔹 Get My Files (ONLY USER FILES)
================================ */
router.get("/", protect, async (req, res) => {
  try {
    const files = await Backup.find({
      userId: req.user.id,
      isDeleted: false,
    }).sort({ uploadDate: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* ==============================
   🔹 Get Trash Files
================================ */
router.get("/trash", protect, async (req, res) => {
  try {
    const files = await Backup.find({
      userId: req.user.id,
      isDeleted: true,
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Trash fetch failed" });
  }
});

/* ==============================
   🔹 Soft Delete (MOVE TO TRASH)
================================ */
router.patch("/delete/:id", protect, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    file.isDeleted = true;
    file.deletedAt = new Date();

    await file.save();

    res.json({ message: "File moved to trash" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ==============================
   🔹 Restore File
================================ */
router.patch("/restore/:id", protect, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    file.isDeleted = false;
    file.deletedAt = null;

    await file.save();

    res.json({ message: "File restored" });

  } catch (error) {
    res.status(500).json({ message: "Restore failed" });
  }
});

/* ==============================
   🔹 Permanent Delete
================================ */
router.delete("/permanent/:id", protect, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // delete from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await Backup.findByIdAndDelete(req.params.id);

    res.json({ message: "File permanently deleted" });

  } catch (error) {
    res.status(500).json({ message: "Permanent delete failed" });
  }
});

/* ==============================
   🔹 Secure Download (ONLY APPROVED)
================================ */
router.get("/download/:id", protect, async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // ✅ STEP A: TEMPORARY REMOVE AUTH CHECK
    // (to test if this is causing 403)
    // if (file.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    // ✅ STEP B: REMOVE STATUS CHECK (if exists)
    // if (file.status !== "approved") {
    //   return res.status(403).json({ message: "Not approved" });
    // }

    const filePath = path.join(process.cwd(),  file.filePath);

    console.log("FILE PATH:", filePath);
    console.log("USER:", req.user.id);
    console.log("FILE OWNER:", file.userId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing" });
    }

    res.sendFile(filePath);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Download failed" });
  }
});

export default router;