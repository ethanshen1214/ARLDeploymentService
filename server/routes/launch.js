const express = require('express');
const Data = require('../bin/launch');
const { spawnSync } = require('child_process');
const router = express.Router();
const fs = require('fs');

stopProject = (projectName) => {
    Data.findOne({ projectName }, function(err, project){
        const { stopScript, path } = project;
        fs.writeFileSync(`${path}/stopScript.sh`, stopScript);
        spawnSync('sh', ['stopScript.sh'], {cwd: path});
    });
}

router.post('/start', async (req, res) => {
    const { projectName } = req.body;
    Data.findOne({ launched: true }, async function(err, launchedProject) {
        if (launchedProject.projectName === projectName) {
            res.send("This project is already started.");
            res.status(200).end();
        }
        else if (launchedProject !== null) {
            await stopProject(launchedProject.projectName);
            Data.findOneAndUpdate({ projectName: launchedProject.projectName }, { launched: false }, function(err, updatedLaunchProject) {
                Data.findOneAndUpdate({ projectName }, { launched: true }, function(err, updatedProject) {
                    if (updatedProject === null) {
                        res.send("Cannot start a project that does not exist in the database.");
                        res.status(200).end();
                    } else {
                        Data.findOne({ projectName }, function(err, project){
                            const { startScript, path } = project;
                            fs.writeFileSync(`${path}/startScript.sh`, startScript);
                            spawnSync('sh', ['startScript.sh'], {cwd: path});
                            res.send("Starting project.");
                            res.status(200).end();
                        });
                    }
                });
            });
        } else {
            Data.findOneAndUpdate({ projectName }, { launched: true }, async function(err, updatedProject) {
                if (updatedProject === null) {
                    res.send("Cannot start a project that does not exist in the database.");
                    res.status(200).end();
                } else {
                    Data.findOne({ projectName }, function(err, project){
                        const { startScript, path } = project;
                        fs.writeFileSync(`${path}/startScript.sh`, startScript);
                        spawnSync('sh', ['startScript.sh'], {cwd: path});
                        res.send("Starting project.");
                        res.status(200).end();
                    });
                }
            });
        }
    });
});

router.post('/stop', async (req, res) => {
    const { projectName } = req.body;
    await stopProject(projectName);
    Data.findOneAndUpdate({ projectName }, { launched: false }, function(err, updatedProject) {
        if (updatedProject === null) {
            res.send("Cannot stop a project that does not exist in the database.");
        }
        res.status(200).end();
    })
    
});

module.exports = router;