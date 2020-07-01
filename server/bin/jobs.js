const https = require('https');
const fs = require('fs');

exports.getJobsByPipeline = (projectId, pipelineId, key, callback) => {
    const apiUrl = fs.readFileSync('./config.json').gitlabUrl;
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
  

exports.getArtifactPath = async (jobId, projectId, key) => {
    const apiUrl = fs.readFileSync('./config.json').gitlabUrl;
    const path = `${apiUrl}/projects/${projectId}/jobs/${jobId}/artifacts`;
    const token = `?private_token=${key}`;
    const query = path + token;

    return query;
};
