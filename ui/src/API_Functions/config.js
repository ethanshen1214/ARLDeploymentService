import axios from 'axios';
const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

const getGitlabHost = async () => {
    const hostEnvVar = 'GITLAB_HOST';
    const defaultHost = 'gitlab.com';
    const gitlabHostFromEnv = process.env[hostEnvVar];
    const gitlabHostFromConfig = await axios.post(`${apiEndpointUrl}/configData/getGitlabUrl`);
  
    const host = gitlabHostFromConfig || defaultHost;
    if (!gitlabHostFromConfig) {
      console.warn(`${hostEnvVar} environment variable not set.`);
    }
  
    console.log(`Using GitLab Host: ${host}`);
    return host;
  };
  
  const protocol = 'https';
  const gitlabHost = getGitlabHost();
  const gitlabUrl = `${protocol}://${gitlabHost}`;
  const apiUrl = `${gitlabUrl}/api/v4`;
  
  
  module.exports = {
    gitlabHost,
    gitlabUrl,
    apiUrl,
    defaultHistoryLength: 5,
  };
  