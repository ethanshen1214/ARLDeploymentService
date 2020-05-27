const https = require('https');
const querystring = require('querystring');
const { apiUrl } = require('../lib/config.js');

exports.getJobsByPipeline = (projectId, pipelineId, key, callback) => {
    const path = `${apiUrl}/projects/${projectId}/pipelines/${pipelineId}/jobs`;
    const token = `?private_token=${key}`;
    const query = path + token;
  
    https.get(query, (res) => {
      let fullData = '';
  
      res.on('data', (d) => {
        fullData += d;
      });
  
      res.on('end', () => {
        const parsedData = JSON.parse(fullData);
        const jobData = [];
  
        for (let i = 0; i < parsedData.length; i++) {
          const jobObj = {
            id: parsedData[i].id,
          };
          jobData.push(jobObj);
        }
        callback(null, jobData);
      });
  
      res.on('error', (e) => {
        callback(e, null);
      });
    });
  };
  

exports.getArtifact = async (jobId, projectId, key, callback) => {
    const path = `${apiUrl}/projects/${projectId}/jobs/${jobId}/artifacts/public`;
    const token = `private_token=${key}`;
    const query = path + token;

    https.get(query, (res) => {
        let fullData = '';
    
        res.on('data', (d) => {
          fullData += d;
        });
    
        res.on('end', () => {
          callback(null, fullData);
        });
    
        res.on('error', (e) => {
          callback(e, null);
        });
    });
};
