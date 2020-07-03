const axios = require('axios');
const fs = require('fs');

exports.getProjectName = async (projectId) => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const path = `${config.gitlabUrl}/projects/${projectId}`;
    const token = `?private_token=${config.authKey}`;
    const query = path + token;
  
    const response = await axios.get(query).catch(err => {});
    if(response) return response.data.name;
    return false;
};

exports.getProjects = async () => {
  const config = JSON.parse(fs.readFileSync('./config.json'));
  const path = `${config.gitlabUrl}/projects`;
  const token = `?private_token=${config.authKey}&membership=true&simple=true`;
  const query = path + token;

  let response = await axios.get(query).catch(err => {})
  if(response) return response.data;
  return false;
}
