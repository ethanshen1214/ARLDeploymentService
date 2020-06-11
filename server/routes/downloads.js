const express = require('express');
const { spawn } = require('child_process');
const config = require('../../src/lib/config.json');
const jobs = require('../../src/API_Functions/jobs.js');
const axios = require('axios');
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
  let key = config.auth_key;

  
  jobs.getJobsByPipeline(projectId, pipelineId, key, (err, jobData) => {
    console.log('Here')
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
      .then((query) => {
        spawn('sh', ['download.sh', projectId, query], {cwd: './downloadScripts'});
        Data.findOne({ projectId: projectId }, function(err, adventure) {
          fs.writeFileSync(process.env.DEPLOYMENT_SERVER + '/runner.sh', adventure.script);
          spawn('sh', ['runner.sh'], {cwd: process.env.DEPLOYMENT_SERVER});
        });
        res.status(200).end();
      });
    }
  });
});

exports.router = router;
