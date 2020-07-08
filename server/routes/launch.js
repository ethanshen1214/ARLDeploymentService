const express = require('express');
const Data = require('../bin/launch');
const { spawn } = require('child_process');
const router = express.Router();
const fs = require('fs');

const { sendSocketData } = require('../bin/sockets');

// spawns a child process to stop the currently running project
// INPUT: Name (ID) of currently running project
// OUTPUT: true -- successfully stopped project (or project has not yet hit error)
//         false -- failed to stop project due to faulty file path
stopProject = async (projectName) => {
    let projectStopped = true;
    const project = await Data.findOne({ projectName }).exec();
    const { stopScript, path } = project;
    if(fs.existsSync(path)){
        const child =  spawn('bash', [`-c`, `${stopScript}`], { cwd: path });
        child.stderr.on('data', async (data) => { // event emitter to catch error in child process
            const errorMessage = data.toString().trim();
            if(errorMessage) {
                await Data.findOneAndUpdate({ projectName }, { launched: null }).exec();
                sendSocketData({ type: "failedProcessStop", message: errorMessage });
            }
        });
    } else {
        sendSocketData({ type: "faultyStopPath" });
        projectStopped = false;
    }
    return projectStopped;
}

// route stops any previously running project before spawning a child process to start a new project
router.post('/start', async (req, res) => {
    const { projectName } = req.body;
    try {
        const launchedProject = await Data.findOne({ launched: true }).exec();
        if (launchedProject !== null && launchedProject.projectName === projectName) { // previously running project same as launch request --- do nothing
            res.status(200).end();
        }
        else if (launchedProject !== null) { // previously running project --- stopping old project then starting new one
            const projectStopped = await stopProject(launchedProject.projectName);
            if(!projectStopped) {
                res.status(200).end();
            } else {
                await Data.findOneAndUpdate({ projectName: launchedProject.projectName }, { launched: false }).exec();
                const newProject = await Data.findOne({ projectName }).exec();
                if (newProject === null) { 
                    return res.status(200).end(); 
                }
                const { startScript, path } = newProject;
                if(fs.existsSync(path)) {
                    const child = spawn('bash', [`-c`, `${startScript}`], { cwd: path });
                    child.stderr.on('data', async (data) => { // event emitter to catch error in child process
                        const errorMessage = data.toString().trim();
                        if(errorMessage) {
                            await Data.findOneAndUpdate({ projectName }, { launched: null }).exec();
                            sendSocketData({ type: "failedProcessStart", message: errorMessage });
                        }
                    });
                    await Data.findOneAndUpdate({ projectName }, { launched: true }).exec();
                    sendSocketData({ type: "success" });
                    res.status(200).end();
                } else {
                    sendSocketData({ type: "success", type: "faultyStartPath" });
                    res.status(200).end();
                }
            }
        }
        else { // no previously running project --- starting new project
            const newProject = await Data.findOne({ projectName }).exec();
            if (newProject === null) {
                return res.status(200).end(); 
            }
            const { startScript, path } = newProject;
            if(fs.existsSync(path)) {
                const child =  spawn('bash', [`-c`, `${startScript}`], { cwd: path });
                child.stderr.on('data', async (data) => { // event emitter to catch error in child process
                    const errorMessage = data.toString().trim();
                    if(errorMessage) {
                        await Data.findOneAndUpdate({ projectName }, { launched: null }).exec();
                        sendSocketData({ type: "failedProcessStart", message: errorMessage });
                    }
                });
                await Data.findOneAndUpdate({ projectName }, { launched: true }).exec();
                sendSocketData({ type: "success" });
                res.status(200).end();
            } else {
                sendSocketData({ type: 'faultyStartPath' });
                res.status(200).end();
            }  
        }
    } catch (err) {
        console.log(err);
    }
});

    
// route to stop a project, calls stopProject function
router.post('/stop', async (req, res) => {
    Data.findOne({ launched: true }, { launched: false }, async function(err, projectToStop) {
        if (projectToStop === null) { // no project running --- do nothing
            sendSocketData({ type: "noProjectRunning" });
        } else { // project running --- execute stopProject
            const result = await stopProject(projectToStop.projectName);
            if (result) { // succeeded in stopping project (or child process has not errored)
                await Data.findOneAndUpdate({ projectName: projectToStop.projectName }, { launched: false }).exec();
                sendSocketData({ type: "success" });
                res.status(200).end();
            } else { // failed to stop project
                await Data.findOneAndUpdate({ projectName: projectToStop.projectName }, { launched: true }).exec();
                res.status(200).end();
            }
        }
        res.status(200).end();
    })
});

module.exports = router;