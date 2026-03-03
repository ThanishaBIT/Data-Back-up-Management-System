import mongoose from "mongoose";

const backupSchema = new mongoose.Schema({
  fileName: String,

  filePath: String,

  fileSize: Number,

  isDeleted: {
    type: Boolean,
    default: false,
  },

  uploadDate: {
    type: Date,
    default: Date.now,
  },

  deletedAt: {
    type: Date,
    default: null,   // 👈 IMPORTANT for 5-day auto delete
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }

});

const Backup = mongoose.model("Backup", backupSchema);

export default Backup;