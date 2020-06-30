const express = require('express');
const Data = require('../bin/launch');
const { spawnSync } = require('child_process');
const router = express.Router();
const fs = require('fs');

stopProject = async (projectName) => {
    let projectStopped = false;
    await Data.findOne({ projectName }, function(err, project){
        if(fs.existsSync(project.path)){
            const { stopScript, path } = project;
            fs.writeFileSync(`${path}/stopScript.sh`, stopScript);
            spawnSync('sh', ['stopScript.sh'], {cwd: path});
            projectStopped = true;
        }
    });
    return projectStopped;
    
}

router.post('/start', async (req, res) => {
    const { projectName } = req.body;
    try {
        const launchedProject = await Data.findOne({ launched: true }).exec();
        if (launchedProject !== null && launchedProject.projectName === projectName) {
            res.send("This project is already running.");
            res.status(200).end();
        }
        else if (launchedProject !== null) {
            const projectStopped = await stopProject(launchedProject.projectName);
            if(!projectStopped) {
                res.send("Could not halt previously running project because file path to that project is no longer valid.\nCancelling start project command.");
                res.status(200).end();
            } else {
                await Data.findOneAndUpdate({ projectName: launchedProject.projectName }, { launched: false }).exec();
                const newProject = await Data.findOne({ projectName }).exec();
                if (newProject === null) {
                    res.send("Previous project halted.\nCannot start a project that does not exist in the database.");
                    res.status(200).end();
                } else {
                    const { startScript, path } = newProject;
                    if(fs.existsSync(path)) {
                        fs.writeFileSync(`${path}/startScript.sh`, startScript);
                        spawnSync('sh', ['startScript.sh'], {cwd: path});
                        await Data.findOneAndUpdate({ projectName }, { launched: true }).exec();
                        res.send("Previous project halted.\nNew project started.");
                        res.status(200).end();
                    } else {
                        res.send("Previous project halted.\nNew project not started because file path to that project is no longer valid.");
                        res.status(200).end();
                    }
                }
            }
        }
        else {
            const newProject = await Data.findOne({ projectName }).exec();
            if (newProject === null) {
                res.send("Cannot start a project that does not exist in the database.");
                res.status(200).end();
            } else {
                const { startScript, path } = newProject;
                if(fs.existsSync(path)) {
                    fs.writeFileSync(`${path}/startScript.sh`, startScript);
                    spawnSync('sh', ['startScript.sh'], {cwd: path});
                    await Data.findOneAndUpdate({ projectName }, { launched: true }).exec();
                    res.send("New project started.");
                    res.status(200).end();
                } else {
                    res.send("New project not started because file path to that project is no longer valid.");
                    res.status(200).end();
                }
            }  
        }
    } catch (err) {
        console.log(err);
    }
});

    

router.post('/stop', async (req, res) => {
    Data.findOneAndUpdate({ launched: true }, { launched: false }, async function(err, updatedProject) {
        if (updatedProject === null) {
            res.send("No projects currently running.");
        } else {
            await stopProject(updatedProject.projectName);
            res.send("Stopped currently running project.");
        }
        res.status(200).end();
    })
});

module.exports = router;