require('dotenv').config();
const express = require('express');
const { spawnSync } = require('child_process');
const jobs = require('../bin/jobs.js');
const fs = require('fs');
const Data = require('../bin/data');

var router = express.Router();

/* Handles POST to route */
router.post('/', function(req, res, next) {
  let config = JSON.parse(fs.readFileSync('./config.json'));
  let projectId = req.body.projectId;
  let pipelineId = req.body.pipelineId;
  let key = config.authKey;
  
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
        spawnSync('sh', ['download.sh', projectId, query, config.downloadPath], {cwd: './downloadScripts'});
        Data.findOne({ projectId: projectId }, function(err, adventure) {
          fs.writeFileSync(`${config.downloadPath}/${projectId}/runner.sh`, adventure.script);
          spawnSync('sh', ['runner.sh', projectId, query], {cwd: `${config.downloadPath}/${projectId}`});
          res.status(200).end();
        });          
      });
    }
  });
});

module.exports = router;
