require('dotenv').config();
const express = require('express');
const { spawnSync } = require('child_process');
const jobs = require('../../ui/src/API_Functions/jobs.js');
const fs = require('fs');
const Data = require('../data');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Handles POST to route */
router.post('/', function(req, res, next) {
  let projectId = req.body.projectId;
  let pipelineId = req.body.pipelineId;
  let key = JSON.parse(fs.readFileSync('./config.json')).authKey;

  
  jobs.getJobsByPipeline(projectId, pipelineId, key, (err, jobData) => {
    if (err) {
      console.error(err);
      res.status(500).end();
    } else {
      let lastJobId = jobData[jobData.length-1].id;
      const tempJob = {
        job: lastJobId,
        project: projectId,
        pipeline: pipelineId,
      }
      
      jobs.getArtifactPath(lastJobId, projectId, key)
      .then(async (query) => {
        spawnSync('sh', ['download.sh', projectId, query], {cwd: './downloadScripts'});
        Data.findOne({ projectId: projectId }, function(err, adventure) {
          fs.writeFileSync(`../../Artifact-Downloads/${projectId}/runner.sh`, adventure.script);
          spawnSync('sh', ['runner.sh', projectId, query], {cwd: `../../Artifact-Downloads/${projectId}`});
          res.status(200).end();
        });
      });
    }
  });
});

exports.router = router;
