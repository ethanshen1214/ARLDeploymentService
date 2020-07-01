const getGitlabHost = () => {
  const hostEnvVar = 'GITLAB_HOST';
  const defaultHost = 'gitlab.com';
  const gitlabHostFromEnv = process.env[hostEnvVar];

  const host = gitlabHostFromEnv || defaultHost;
  if (!gitlabHostFromEnv) {
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
