import express from "express";
import multer from "multer";
import protect from "../middleware/authMiddleware.js";

import {
  uploadFile,
  getFiles,
  deleteFile,
  restoreFile,
  updateFile,
  getTrashFiles ,
  downloadFile
} from "../controllers/backupController.js";

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 5MB
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
// APIs
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, getFiles);
router.get("/trash", protect, getTrashFiles);
router.patch("/delete/:id", protect, deleteFile);
router.patch("/restore/:id", protect, restoreFile);
router.put("/update/:id", protect, upload.single("file"), updateFile);
router.get("/download/:id", protect, downloadFile);
export default router;
