require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const jobs = require('../../ui/src/API_Functions/jobs.js');
const axios = require('axios');
const { sendPipelineUpdate } = require('../bin/sockets')
const fs = require('fs');
const Data = require('../data');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Handles POST to route */
router.post('/', function(req, res, next) {
  if (req.body.builds[req.body.builds.length-1].finished_at !== null){
    let projectId = req.body.project.id;
    let pipelineId = req.body.object_attributes.id;
    let key = process.env.AUTH_KEY;

    axios.post('http://localhost:8080/database/updateData', {projectId: projectId, update: {pipelineId: pipelineId}})
    .then(jobs.getJobsByPipeline(projectId, pipelineId, key, (err, jobData) => {
      if (err) {
        console.error(err);
        res.status(500).end();
      } else {
        let lastJobId = jobData[jobData.length-1].id;
        jobs.getArtifactPath(lastJobId, projectId, key)
        .then((query) => {
          spawn('sh', ['download.sh', projectId, query], {cwd: './downloadScripts'});
          sendPipelineUpdate({
            type: 'success',
            projectId: projectId,
            pipelineId: pipelineId,
          });
          Data.findOne({ projectId: projectId }, function(err, adventure) {
            fs.writeFileSync(`../../Artifact-Downloads/${projectId}/runner.sh`, adventure.script);
            spawn('sh', ['runner.sh'], {cwd: `../../Artifact-Downloads/${projectId}`});
          });
          res.status(200).end();
        });
      }
    }));
  }
  else {
    sendPipelineUpdate({
      type: 'pending',
    });
    res.status(200).end();
  }
});

module.exports = router;
