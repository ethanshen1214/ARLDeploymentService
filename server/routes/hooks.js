const express = require('express');
const { spawn } = require('child_process');
const config = require('../../src/lib/config.json');
const jobs = require('../../src/API_Functions/jobs.js');
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
    let key = config.auth_key;

    axios.post('http://localhost:8080/database/updateData', {projectId: projectId, update: {pipelineId: pipelineId}})
    .then(jobs.getJobsByPipeline(projectId, pipelineId, key, (err, jobData) => {
      if (err) {
        console.error(err);
        res.status(500).end();
      } else {
        let lastJobId = jobData[jobData.length-1].id;
        jobs.getArtifactPath(lastJobId, projectId, key)
        .then((query) => {
          spawn('sh', ['download.sh', projectId, query], {cwd: './server/downloadScripts'});
          sendPipelineUpdate({
            type: 'success',
            projectId: projectId,
            pipelineId: pipelineId,
          });
          Data.findOne({ projectId: projectId }, function(err, adventure) {
            fs.writeFileSync(process.env.DEPLOYMENT_SERVER + '/runner.sh', adventure.script);
            spawn('sh', ['runner.sh'], {cwd: process.env.DEPLOYMENT_SERVER});
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
  }
});

module.exports = router;
