import express from "express";
import multer from "multer";
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
router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.patch("/delete/:id", deleteFile);
router.patch("/restore/:id", restoreFile);
router.put("/update/:id", upload.single("file"), updateFile);
router.get("/trash", getTrashFiles);


export default router;
