const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// database structure for deployment database
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

module.exports = mongoose.model("Data", DataSchema);