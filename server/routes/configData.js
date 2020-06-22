var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/getAuthKey', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).authKey);
    res.status(200).end();
})

router.post('/getMongoURL', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).mongoDb);
    res.status(200).end();
})

router.post('/getDownloadPath', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).downloadPath);
    res.status(200).end();
})

router.post('/setAuthKey', (req, res) => {
    if (req.body.authKey !== '') {
        const oldConfig = JSON.parse(fs.readFileSync('./config.json'));
        fs.writeFileSync('./config.json', JSON.stringify({ authKey: req.body.authKey, mongoDb: oldConfig.mongoDb, downloadPath: oldConfig.downloadPath }));
        res.status(200).end();
    }
})

router.post('/setDownloadPath', (req, res) => {
    if (req.body.downloadPath !== '') {
        const oldConfig = JSON.parse(fs.readFileSync('./config.json'));
        fs.writeFileSync('./config.json', JSON.stringify({ authKey: oldConfig.authKey, mongoDb: oldConfig.mongoDb, downloadPath: req.body.downloadPath }));
        res.status(200).end();
    }
})

module.exports = router;