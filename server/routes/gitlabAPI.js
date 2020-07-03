const express = require('express');

const { getPipelinesForProject } = require('../gitlabApiFunctions/pipelines.js');
const { getProjects, getProjectName } = require('../gitlabApiFunctions/projects.js');

const router = express.Router();

router.post('/getPipelinesForProject', async (req, res) => {
    const pipelines = await getPipelinesForProject(req.body.projectId);
    res.json({ pipelines });
    res.status(200).end();
});

router.post('/getProjectName', async (req, res) => {
    const projectName = await getProjectName(req.body.projectId);
    res.json({ projectName });
    res.status(200).end();
});

router.post('/getProjects', async (req, res) => {
    const projects = await getProjects();
    res.json({ projects });
    res.status(200).end();
});

module.exports = router;