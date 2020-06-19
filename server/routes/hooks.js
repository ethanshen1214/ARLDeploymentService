require('dotenv').config();
const express = require('express');
const { spawnSync } = require('child_process');
const jobs = require('../bin/jobs.js');
const { sendPipelineUpdate } = require('../bin/sockets')
const fs = require('fs');
const Data = require('../bin/data');

var router = express.Router();

/* Handles POST to route */
router.post('/', function(req, res, next) {
  if (req.body.builds[req.body.builds.length-1].finished_at !== null){
    let projectId = req.body.project.id;
    let pipelineId = req.body.object_attributes.id;
    let key = JSON.parse(fs.readFileSync('./config.json')).authKey;

    Data.findOneAndUpdate( {projectId: projectId}, { pipelineId } ).catch((err) => console.log('Failed to update database on hook.'));
    jobs.getJobsByPipeline(projectId, pipelineId, key, (err, jobData) => {
      if (err) {
        console.error(err);
        res.status(500).end();
      } else {
        let lastJobId = jobData[jobData.length-1].id;
        jobs.getArtifactPath(lastJobId, projectId, key)
        .then((query) => {
          spawnSync('sh', ['download.sh', projectId, query], {cwd: './downloadScripts'});
          Data.findOne({ projectId: projectId }, function(err, adventure) {
            fs.writeFileSync(`../../Artifact-Downloads/${projectId}/runner.sh`, adventure.script);
            spawnSync('sh', ['runner.sh', projectId, query], {cwd: `../../Artifact-Downloads/${projectId}`});
            sendPipelineUpdate({
              type: 'success',
              projectId: projectId,
              pipelineId: pipelineId,
            });
            res.status(200).end();
          });
        });
      }
    });
  }
  else {
    sendPipelineUpdate({
      type: 'pending',
    });
    res.status(200).end();
  }
});

module.exports = router;
