const express = require('express');
const Data = require('../bin/launch');
const { spawnSync } = require('child_process');
const router = express.Router();
const fs = require('fs');

stopProject = async (projectName) => {
    let projectStopped = {type: "", success: true};
    const result = await Data.findOne({ projectName }, function(err, project){
        if(fs.existsSync(project.path)){
            const { stopScript, path } = project;
            const commands = stopScript.split(/\r\n|\n|\r/).map(cmd => cmd.split(" "));
            for (let i = 0; i < commands.length; i++) {
                cmd = commands[i];
                const child = spawnSync(cmd[0], cmd.slice(1), { cwd: path });
                if (child.stderr.toString().trim()) {
                    projectStopped = {type: "failedProcess", success: false};
                    break;
                }
            }
        } else {
            projectStopped = {type: "filePath", success: false};
        }
    });
    return projectStopped;
}

router.post('/start', async (req, res) => {
    const { projectName } = req.body;
    try {
        const launchedProject = await Data.findOne({ launched: true }).exec();
        if (launchedProject !== null && launchedProject.projectName === projectName) {
            res.json({success: false, type: 'alreadyRunning', message: "This project is already running."});
            res.status(200).end();
        }
        else if (launchedProject !== null) {
            const projectStopped = await stopProject(launchedProject.projectName);
            if(!projectStopped.success) {
                if (projectStopped.type === "filePath") {
                    res.json({success: false, type: 'oldPath', message: "Could not halt previously running project because file path to that project is no longer valid.\nCancelling start project command."});
                    res.status(200).end();
                }
                else if(projectStopped.type === "failedProcess") {
                    res.json({success: false, type: 'failedProcessStop', message: "Previously running project not stopped due to error in user input stop script.\nCancelling start project command."});
                    res.status(200).end();
                }
            } else {
                await Data.findOneAndUpdate({ projectName: launchedProject.projectName }, { launched: false }).exec();
                const newProject = await Data.findOne({ projectName }).exec();
                if (newProject === null) {
                    res.json({success: false, type: 'nonExistent', message: "Previous project halted.\nCannot start a project that does not exist in the database."});
                    res.status(200).end();
                } else {
                    const { startScript, path } = newProject;
                    if(fs.existsSync(path)) {
                        const commands = startScript.split(/\r\n|\n|\r/).map(cmd => cmd.split(" "));
                        for (let i = 0; i < commands.length; i++) {
                            cmd = commands[i];
                            const child = spawnSync(cmd[0], cmd.slice(1), { cwd: path });
                            if (child.stderr.toString().trim()) {
                                res.json({success: false, type: 'failedProcessStart', message: "Cannot start new project due to error in user input start script.\nCancelling start project command."});
                                return res.status(200).end();
                            }
                        }
                        await Data.findOneAndUpdate({ projectName }, { launched: true }).exec();
                        res.json({success: true, message: "Previous project halted.\nNew project started."});
                        res.status(200).end();
                    } else {
                        res.json({success: false, type: 'newPath', message: "Previous project halted.\nNew project not started because file path to that project is no longer valid."});
                        res.status(200).end();
                    }
                }
            }
        }
        else {
            const newProject = await Data.findOne({ projectName }).exec();
            if (newProject === null) {
                res.json({success: false, type: 'nonExistent', message: "Cannot start a project that does not exist in the database."});
                res.status(200).end();
            } else {
                const { startScript, path } = newProject;
                if(fs.existsSync(path)) {
                    const commands = startScript.split(/\r\n|\n|\r/).map(cmd => cmd.split(" "));
                    for (let i = 0; i < commands.length; i++) {
                        cmd = commands[i];
                        const child = spawnSync(cmd[0], cmd.slice(1), { cwd: path });
                        if (child.stderr.toString().trim()) {
                            res.json({success: false, type: 'failedProcessStart', message: "Cannot start new project due to error in user input start script.\nCancelling start project command."});
                            return res.status(200).end();
                        }
                    }
                    await Data.findOneAndUpdate({ projectName }, { launched: true }).exec();
                    res.json({success: true, message: "Previous project halted.\nNew project started."});
                    res.status(200).end();
                } else {
                    res.json({success: false, type: 'newPath', message: "New project not started because file path to that project is no longer valid."});
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
            res.json({success: false, type: 'noProjectRunning', message: "No projects currently running."})
        } else {
            const result = await stopProject(updatedProject.projectName);
            if (result.success) {
                res.json({success: true, type: 'projectStopped', message: "Project stopped."});
            } else {
                await Data.findOneAndUpdate({ projectName: updatedProject.projectName }, { launched: true }).exec();
                if (result.type === "filePath") {
                    res.json({ success: false, type: 'failedProcessStop', message: "Could not halt previously running project because file path to that project is no longer valid." })
                }
                else if (result.type === "failedProcess") {
                    res.json({ success: false, type: 'filePath', message: "Previously running project not stopped due to error in user input stop script." })
                }
            }
        }
        res.status(200).end();
    })
});

module.exports = router;