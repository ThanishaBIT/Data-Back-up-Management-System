import Backup from "../models/Backup.js";
import fs from "fs";
import path from "path";

// ✅ Upload File
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received from frontend" });
    }

    const newFile = new Backup({
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      userId: req.user.id,
      isDeleted: false,
      deletedAt: null
    });

    await newFile.save();

    res.json({ message: "File uploaded", data: newFile });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed" });
  }
};


// ✅ Get All Active Files
export const getFiles = async (req, res) => {
  try {
    const files = await Backup.find({
      isDeleted: false,
      userId: req.user.id
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};


// ✅ Soft Delete (Move to Trash)
export const deleteFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.isDeleted = true;
    file.deletedAt = new Date();  // ⭐ Important for 5-day cleanup

    await file.save();

    res.json({ message: "File moved to trash" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};


// ✅ Restore File
export const restoreFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.isDeleted = false;
    file.deletedAt = null;  // ⭐ Reset delete timer

    await file.save();

    res.json({ message: "File restored" });

  } catch (error) {
    res.status(500).json({ message: "Restore failed" });
  }
};


// ✅ Update File (Replace old file)
export const updateFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // delete old file physically
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // update new file details
    file.fileName = req.file.filename;
    file.filePath = req.file.path;
    file.fileSize = req.file.size;

    await file.save();

    res.json({ message: "File updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};


// ✅ Get Trash Files
export const getTrashFiles = async (req, res) => {
  try {
    const trash = await Backup.find({
      isDeleted: true,
      userId: req.user.id
    });

    res.json(trash);

  } catch (error) {
    res.status(500).json({ message: "Trash fetch failed" });
  }
};
//download the file
export const downloadFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 🔐 Security check
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fullPath = path.resolve(file.filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Physical file missing" });
    }

    // ✅ VERY IMPORTANT — Add these two lines
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.fileName}"`
    );

    res.sendFile(fullPath);

  } catch (error) {
    console.log("Download error:", error);
    res.status(500).json({ message: "Download failed" });
  }
};