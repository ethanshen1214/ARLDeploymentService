const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// database structure for launch database
const LaunchSchema = new Schema(
  {
    projectName: String,
    startScript: String,
    stopScript: String,
    path: String,
    launched: Boolean,
  },
  { timestamps: true }
);

LaunchSchema.index({"projectName": 1}, {unique: true});

module.exports = mongoose.model("Launch", LaunchSchema);