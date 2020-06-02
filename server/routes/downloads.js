var express = require('express');
const { spawn } = require('child_process');
const config = require('../../src/lib/config.json');
const jobs = require('../../src/API_Functions/jobs.js');
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

  let header = `PRIVATE TOKEN: ${key}`;
  jobs.getJobsByPipeline(projectId, pipelineId, key, (err, jobData) => {
    if (err) {
      console.error(err);
      res.status(500).end();
    } else {
      let lastJobId = jobData[jobData.length-1].id;
      jobs.getArtifactPath(lastJobId, projectId, key)
      .then((path) => {
        console.log('Gitlab API Call ' + header + " " + `${path}`);
        spawn('sh', ['zip.sh', projectId, header, path], {cwd: './downloadScripts'});
        res.status(200).end();
      });
    }
  });
});

module.exports = router;
