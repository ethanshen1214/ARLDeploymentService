const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    projectName: String,
    projectId: Number,
    pipelineId: Number,
    script: String,
  },
  { timestamps: true }
);

DataSchema.index({"projectId": 1}, {unique: true});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Data", DataSchema);