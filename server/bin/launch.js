const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
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

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Launch", LaunchSchema);