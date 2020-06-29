const express = require('express');
const Data = require('../bin/launch');
const { spawnSync } = require('child_process');
const router = express.Router();
const fs = require('fs');

router.post('/start', (req, res) => {
    const { projectName } = req.body;
    Data.findOne({ projectName }, function(err, project){
        const { startScript, downloadPath } = project;
        fs.writeFileSync(`${downloadPath}/startScript.sh`, startScript);
        spawnSync('sh', ['startScript.sh'], {cwd: downloadPath});
        res.status(200).end();
    });
});

router.post('/stop', (req, res) => {
    const { projectName } = req.body;
    Data.findOne({ projectName }, function(err, project){
        const { stopScript, downloadPath } = project;
        fs.writeFileSync(`${downloadPath}/stopScript.sh`, stopScript);
        spawnSync('sh', ['stopScript.sh'], {cwd: downloadPath});
        res.status(200).end();
    });
});

module.exports = router;