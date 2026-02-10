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
  userId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"User"
}
});

const Backup = mongoose.model("Backup", backupSchema);

export default Backup;
