const https = require('https');
const axios = require('axios');
const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

exports.getProjectName = async (projectId, key, callback) => {
    const apiUrl = await axios.post(`${apiEndpointUrl}/configData/getGitlabUrl`);
    const path = `${apiUrl.data}/projects/${projectId}`;
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
  const apiUrl = await axios.post(`${apiEndpointUrl}/configData/getGitlabUrl`);
  console.log(apiUrl);
  const path = `${apiUrl.data}/projects`;
  const token = `?private_token=${key}&membership=true&simple=true`;
  const query = path + token;

  let response = await axios.get(query).catch(err => {})
  if(response) return response.data;
  return false;
}
