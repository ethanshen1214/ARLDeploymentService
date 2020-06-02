var express = require('express');
const { spawn } = require('child_process');
const config = require('../../src/lib/config.json');
const jobs = require('../../src/API_Functions/jobs.js');
var router = express.Router();

const deployed = [];

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
      if(deployed.length == 0){
        deployed.push(tempJob);
      }
      else{
        //let duplicated = false;
        for(let i = 0; i < deployed.length; i++)
        {
          if((deployed[i].project === tempJob.project)){
            deployed[i] = tempJob;
          }
        }
        // if(!duplicated){
        //   deployed.push(tempJob);
        // }
      }
      
      jobs.getArtifactPath(lastJobId, projectId, key)
      .then((query) => {
        console.log('Gitlab API Call ' + query);
        spawn('sh', ['zip.sh', projectId, query], {cwd: './downloadScripts'});
        res.status(200).end();
      });
    }
  });
});

exports.router = router;
exports.deployed = {deployed};
