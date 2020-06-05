const https = require('https');
const { apiUrl } = require('../lib/config.js');

exports.getProjectName = (projectId, key, callback) => {
    const path = `${apiUrl}/projects/${projectId}`;
    const token = `?private_token=${key}`;
    const query = path + token;
  
    https.get(query, (res) => {
      let fullData = '';
  
      res.on('data', (d) => {
        fullData += d;
      });
  
      res.on('end', () => {
        const parsedData = JSON.parse(fullData);
        const name = parsedData.name;
        callback(null, name);
      });
  
      res.on('error', (e) => {
        callback(e, null);
      });
    });
  };