import Backup from "../models/Backup.js";
import fs from "fs";



// ✅ Upload File

export const uploadFile = async (req, res) => {
  try {

    // ⭐ VERY IMPORTANT SAFETY CHECK
    if (!req.file) {
      return res.status(400).json({ message: "No file received from frontend" });
    }

    const newFile = new Backup({
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
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
  const files = await Backup.find({ isDeleted: false });
  res.json(files);
};


// ✅ Soft Delete (Mistake Delete)
export const deleteFile = async (req, res) => {
  await Backup.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ message: "File moved to trash" });
};


// ✅ Restore File
export const restoreFile = async (req, res) => {
  await Backup.findByIdAndUpdate(req.params.id, { isDeleted: false });
  res.json({ message: "File restored" });
};


// ✅ Update File (Replace old file)
export const updateFile = async (req, res) => {
  try {
    const file = await Backup.findById(req.params.id);

    // delete old file from uploads folder
    fs.unlinkSync(file.filePath);

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
    const trash = await Backup.find({ isDeleted: true });
    res.json(trash);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trash" });
  }
};



