const express = require('express');
const Data = require('../bin/launch');
const { spawnSync } = require('child_process');
const router = express.Router();
const fs = require('fs');

stopProject = async (projectName) => {
    Data.findOne({ projectName }, function(err, project){
        const { stopScript, downloadPath } = project;
        fs.writeFileSync(`${downloadPath}/stopScript.sh`, stopScript);
        spawnSync('sh', ['stopScript.sh'], {cwd: downloadPath});
    });
}

router.post('/start', (req, res) => {
    const { projectName } = req.body;
    Data.findOne({ launched: true }, function(err, launchedProject) {
        if (launchedProject !== null) {
            await stopProject(launchedProject.projectName);
            Data.findOneAndUpdate({ projectName: launchedProject }, { launched: false }, function(err, updatedLaunchProject) {
                Data.findOneAndUpdate({ projectName }, { launched: true }, function(err, updatedProject) {
                    if (updatedProject === null) {
                        res.send("Cannot start a project that does not exist in the database.");
                        res.status(200).end();
                    } else {
                        Data.findOne({ projectName }, function(err, project){
                            const { startScript, downloadPath } = project;
                            fs.writeFileSync(`${downloadPath}/startScript.sh`, startScript);
                            spawnSync('sh', ['startScript.sh'], {cwd: downloadPath});
                            res.send("Starting project.");
                            res.status(200).end();
                        });
                    }
                });
            });
        } else {
            Data.findOneAndUpdate({ projectName }, { launched: true }, function(err, updatedProject) {
                if (updatedProject === null) {
                    res.send("Cannot start a project that does not exist in the database.");
                    res.status(200).end();
                } else {
                    Data.findOne({ projectName }, function(err, project){
                        const { startScript, downloadPath } = project;
                        fs.writeFileSync(`${downloadPath}/startScript.sh`, startScript);
                        spawnSync('sh', ['startScript.sh'], {cwd: downloadPath});
                        res.send("Starting project.");
                        res.status(200).end();
                    });
                }
            });
        }
    });
});

router.post('/stop', (req, res) => {
    const { projectName } = req.body;
    await stopProject(projectName);
    res.status(200).end();
});

module.exports = router;