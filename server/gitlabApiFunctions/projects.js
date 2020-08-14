const axios = require('axios');
const fs = require('fs');

// gitlab api call for the name of a single project
// INPUT: projectId string
// OUTPUT: success -- name of project (string)
//         failure -- false
exports.getProjectName = async (projectId) => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const path = `${config.gitlabUrl}/projects/${projectId}`;
    const token = `?private_token=${config.authKey}`;
    const query = path + token;
  
    const response = await axios.get(query).catch(err => {});
    if(response) return response.data.name;
    return false;
};

// gitlab api call for a list of projects associated with and authentication key
// **only shows projects the user is a member of**
// INPUT: projectId string
// OUTPUT: success -- name of project (string)
//         failure -- false
exports.getProjects = async () => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const path = `${config.gitlabUrl}/projects`;
    const token = `?private_token=${config.authKey}&membership=true&simple=true`;
    const query = path + token;

    let response = await axios.get(query).catch(err => {})
    if(response) return response.data;
    return false;
}
