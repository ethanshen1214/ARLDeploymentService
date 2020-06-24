const https = require('https');
<<<<<<< HEAD:ui/src/API_Functions/projects.js
const { apiUrl } = require('../lib/config.js');
=======
const { apiUrl } = require('./config.js');
>>>>>>> master:src/API_Functions/projects.js
const axios = require('axios');

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
    });
};

exports.getProjects = async (key) => {
  const path = `${apiUrl}/projects`;
  const token = `?private_token=${key}&membership=true&simple=true`;
  const query = path + token;

  let response = await axios.get(query).catch(err => {})
  if(response) return response.data;
  return false;
}
