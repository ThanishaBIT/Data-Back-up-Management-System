import Backup from "../models/Backup.js";
import fs from "fs";
import path from "path";

// ================= UPLOAD CERTIFICATE =================
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }

    console.log("BODY DATA:", req.body);

    const newFile = new Backup({
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      userId: req.user.id,

      // ⭐ NEW FIELDS
      issuer: req.body.issuer,
      category: req.body.category,
      year: req.body.year,
      status: "pending",

      isDeleted: false,
      deletedAt: null
    });

    await newFile.save();

    res.json({ message: "Certificate uploaded", data: newFile });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ================= GET ACTIVE CERTIFICATES =================
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

// ================= DELETE (SOFT DELETE) =================
export const deleteFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.isDeleted = true;
    file.deletedAt = new Date();

    await file.save();

    res.json({ message: "Moved to trash" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= RESTORE =================
export const restoreFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.isDeleted = false;
    file.deletedAt = null;

    await file.save();

    res.json({ message: "Restored successfully" });

  } catch (error) {
    res.status(500).json({ message: "Restore failed" });
  }
};

// ================= UPDATE FILE =================
export const updateFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // delete old file
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // update new file
    file.fileName = req.file.filename;
    file.filePath = req.file.path;
    file.fileSize = req.file.size;

    await file.save();

    res.json({ message: "Updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// ================= GET TRASH =================
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

// ================= DOWNLOAD =================
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
      return res.status(404).json({ message: "File missing" });
    }

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

// ================= ADMIN VERIFY =================
export const verifyCertificate = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const oldPath = file.filePath;
    const fileName = oldPath.split("/").pop();

    const newPath = `uploads/backup/${fileName}`;

    fs.rename(oldPath, newPath, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Move failed" });
      }

      file.filePath = newPath;
      file.status = "verified";

      await file.save();

      res.json({ message: "Verified & moved to vault" });
    });

  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// ================= ADMIN REJECT =================
export const rejectCertificate = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.status = "rejected";
    await file.save();

    res.json({ message: "Rejected" });

  } catch (error) {
    res.status(500).json({ message: "Reject failed" });
  }
};