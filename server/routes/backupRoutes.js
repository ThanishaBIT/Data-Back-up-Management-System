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
} from "../controllers/backupController.js";

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// APIs
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, getFiles);
router.get("/trash", protect, getTrashFiles);
router.patch("/delete/:id", protect, deleteFile);
router.patch("/restore/:id", protect, restoreFile);
router.put("/update/:id", protect, upload.single("file"), updateFile);

export default router;
