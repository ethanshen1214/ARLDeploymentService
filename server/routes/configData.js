var express = require('express');
var router = express.Router();
var fs = require('fs');
const { mongoDb } = require('../config.json');
const mongoose = require('mongoose');
const path = require('path');

let dbRoute = mongoDb;
global.mongooseConnection;

// attempts to connect to database on startup and sets a flag to indicate a successful/unsuccessful connection
mongoose.connect(dbRoute, { useNewUrlParser: true }).catch(error => console.log('MongoDB URL not set.'));
mongoose.set('useFindAndModify', false)
let db = mongoose.connection;
db.once('open', () => {
  mongooseConnection = 1;
  console.log('connected to the database')
});
db.on('error', () => {
  mongooseConnection = 0;
  db.removeAllListeners();
  db.close();
});

router.post('/setMongoURL', (req, res) => {
    const oldConfig = JSON.parse(fs.readFileSync('./config.json'));
    if (req.body.authKey !== '') {
        fs.writeFileSync('./config.json', JSON.stringify({ authKey: oldConfig.authKey, gitlabUrl: oldConfig.gitlabUrl, mongoDb: req.body.url, downloadPath: oldConfig.downloadPath }));
        mongoose.disconnect();
        // attempts to connect to database on user input and sets a flag to indicate a successful/unsuccessful connection
        mongoose.connect(req.body.url, { useNewUrlParser: true }).catch(() => console.log('MongoDB URL invalid.'));
        mongoose.set('useFindAndModify', false); 
        db = mongoose.connection;
        db.once('open', () => {
            mongooseConnection = 1;
            console.log('connected to the database')
        });
        db.on('error', () => {
            mongooseConnection = 0;
            db.removeAllListeners();
            db.close();
        });
    }
    setTimeout(() => { // delay to allow db time to connect
        res.send(mongooseConnection.toString());
        res.status(200).end()
    }, 2500);
});

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
        fs.writeFileSync('./config.json', JSON.stringify({ authKey: req.body.authKey, gitlabUrl: oldConfig.gitlabUrl, mongoDb: oldConfig.mongoDb, downloadPath: oldConfig.downloadPath }));
    }
    res.status(200).end();
})

router.post('/setDownloadPath', (req, res) => {
    if (!path.isAbsolute(`${req.body.downloadPath}`)){
      return res.json({ type: 'notAbs' }).end();
    }
    else if (!fs.existsSync(`${req.body.downloadPath}`)){
      return res.json({ type: 'notEx' }).end();
    }
    else if (req.body.downloadPath !== '') {
        const oldConfig = JSON.parse(fs.readFileSync('./config.json'));
        fs.writeFileSync('./config.json', JSON.stringify({ authKey: oldConfig.authKey, gitlabUrl: oldConfig.gitlabUrl, mongoDb: oldConfig.mongoDb, downloadPath: req.body.downloadPath }));
        res.status(200).end();
    }
})

router.post('/setGitlabUrl', (req, res) => {
    console.log(req.body.gitlabUrl);
    if(req.body.gitlabUrl !== 'https:///api/v4'){
        const oldConfig = JSON.parse(fs.readFileSync('./config.json'));
        fs.writeFileSync('./config.json', JSON.stringify({ authKey: oldConfig.authKey, gitlabUrl: req.body.gitlabUrl, mongoDb: oldConfig.mongoDb, downloadPath: oldConfig.downloadPath }));
    }
    res.status(200).end();
})

router.post('/getGitlabUrl', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).gitlabUrl);
    res.status(200).end();
})




module.exports = router;