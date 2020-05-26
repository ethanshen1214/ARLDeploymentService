const https = require('https');
const querystring = require('querystring');
const { apiUrl } = require('../lib/config.js');

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
  
const getPipeline = (projectId, pipelineId, token) => {
    const path = `${apiUrl}/projects/${projectId}/pipelines/${pipelineId}`;
    const options = `private_token=${token}`;
    const url = `${path}?${options}`;
  
    return request(url)
      .then((res) => JSON.parse(res.body))
      .catch((err) => console.error('Failed to get pipeline ', err));
};
  
exports.getPipelinesForProject = (projectId, historyLength, token) => {
    const path = `${apiUrl}/projects/${projectId}/pipelines`;
    const options = {
        private_token: token,
        per_page: historyLength,
    };
    const url = `${path}?${querystring.stringify(options)}`;

    return request(url)
        .then((res) => JSON.parse(res.body))
        .then((body) => body
        .map((pipeline) => getPipeline(projectId, pipeline.id, token)))
        .then((promises) => Promise.all(promises).then((pipelines) => pipelines))
        .then((pipelines) => pipelines.sort((a, b) => b.id - a.id))
        .catch((err) => {
        console.error('Failed to get pipelines', err);
        });
};  