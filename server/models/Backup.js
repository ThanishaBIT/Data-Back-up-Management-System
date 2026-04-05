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
  },
  issuer: {
  type: String,
  default: "N/A"
},
category: {
  type: String,
  default: "General"
},
year: {
  type: Number
},
status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
}


});

const Backup = mongoose.model("Backup", backupSchema);

export default Backup;