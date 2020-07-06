const https = require('https');
const fs = require('fs');

// gitlab api call to obtain a job list for a single pipeline
// INPUT: projectId, pipelineId, and authentication key strings and a callback function
// OUTPUT: success -- execute callback with data
//         error -- execute callback with error
exports.getJobsByPipeline = (projectId, pipelineId, key, callback) => {
    const apiUrl = JSON.parse(fs.readFileSync('./config.json')).gitlabUrl;
    console.log(apiUrl);
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
  
// returns gitlab api query to download artifact to be (used in download.sh bash script)
// INPUT: jobId, projectId, and authentication key strings
// OUTPUT: gitlab api query
exports.getArtifactPath = async (jobId, projectId, key) => {
    const apiUrl = JSON.parse(fs.readFileSync('./config.json')).gitlabUrl;
    const path = `${apiUrl}/projects/${projectId}/jobs/${jobId}/artifacts`;
    const token = `?private_token=${key}`;
    const query = path + token;

    return query;
};
