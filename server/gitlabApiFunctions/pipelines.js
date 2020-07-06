const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

// Code used is from Gitlab-Utils project

// services https requests
// INPUT: url of https request and data from https response
// OUTPUT: success -- resolve promise and return data
//         error -- reject promise
const request = (url, data = '') => new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      res.setEncoding('utf8');
      let body = '';
  
      res.on('data', (d) => {
        body += d.toString();
      });
      res.on('error', reject);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        } else {
          const e = `Request failed. status: ${res.statusCode}, body: ${body}`;
          reject(new Error(e));
        }
      });
    });
  
    req.on('error', reject);
    req.write(data, 'binary');
    req.end();
});

// gitlab api call to retrieve a single pipeline
// INPUT: projectId and pipelineId strings
// OUTPUT: success -- resolve promise and return api response
//         error -- reject promise  and return error
const getPipeline = async (projectId, pipelineId) => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const path = `${config.gitlabUrl}/projects/${projectId}/pipelines/${pipelineId}`;
    const options = `private_token=${config.authKey}`;
    const url = `${path}?${options}`;
  
    return request(url)
      .then((res) => JSON.parse(res.body))
      .catch((err) => console.error('Failed to get pipeline ', err));
};

// gitlab api call to retrieve a list of pipelines for a project
exports.getPipelinesForProject = async (projectId) => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const path = `${config.gitlabUrl}/projects/${projectId}/pipelines`;
    const options = {
        private_token: config.authKey,
        defaultHistoryLength: 10,
    };
    const url = `${path}?${querystring.stringify(options)}`;
    return request(url)
        .then((res) => JSON.parse(res.body))
        .then((body) => body
        .map((pipeline) => getPipeline(projectId, pipeline.id)))
        .then((promises) => Promise.all(promises).then((pipelines) => pipelines))
        .then((pipelines) => pipelines.sort((a, b) => b.id - a.id))
        .catch((err) => {
          console.error('Failed to get pipelines ', err)
        });
};  