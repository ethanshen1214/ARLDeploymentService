const express = require('express');
const mongoose = require('mongoose');
const Data = require('../bin/data');
const { mongoDb } = require('../config.json');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let dbRoute = mongoDb;
let connected;

// attempts to connect to database on startup and sets a flag to indicate a successful/unsuccessful connection
mongoose.connect(dbRoute, { useNewUrlParser: true }).catch(error => console.log('MongoDB URL not set.'));
mongoose.set('useFindAndModify', false)
let db = mongoose.connection;
db.once('open', () => {
  connected = 1;
  console.log('connected to the database')
});
db.on('error', () => {
  connected = 0;
  db.removeAllListeners();
  db.close();
});

router.post('/setMongoURL', (req, res) => {
  const oldConfig = JSON.parse(fs.readFileSync('./config.json'));
  if (req.body.authKey !== '') {
    fs.writeFileSync('./config.json', JSON.stringify({ authKey: oldConfig.authKey, mongoDb: req.body.url, downloadPath: oldConfig.downloadPath }));
    mongoose.disconnect();
    // attempts to connect to database on user input and sets a flag to indicate a successful/unsuccessful connection
    mongoose.connect(req.body.url, { useNewUrlParser: true }).catch(() => console.log('MongoDB URL invalid.'));
    mongoose.set('useFindAndModify', false);
    db = mongoose.connection;
    db.once('open', () => {
      connected = 1;
      console.log('connected to the database')
    });
    db.on('error', () => {
      connected = 0;
      db.removeAllListeners();
      db.close();
    });
  }
  res.status(200).end();
});

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  if(connected) {
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  } else {
    return res.json({ success: false, data: 'noDbUrl' });
  }
});
  
// this is our update method
// this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
    let config = JSON.parse(fs.readFileSync('./config.json'));
    if(!path.isAbsolute(`${config.downloadPath}`)){
      return res.json({ type: 'notAbs' }).end();
    }
    if(!fs.existsSync(`${config.downloadPath}`)){
      return res.json({ type: 'notEx' }).end();
    }

    const { projectId, update } = req.body;
    Data.findOneAndUpdate( {projectId: projectId}, update, (err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
});
  
// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
    const { projectId } = req.body;
    Data.findByIdAndRemove(projectId, (err) => {
      if (err) return res.send(err);
      return res.json({ success: true });
    });
});
  
// this is our create method
// this method adds new data in our database
router.post('/putData', (req, res) => {
  let data = new Data();
  const { projectId, pipelineId, script, projectName } = req.body;
  Data.findOne( {projectId}, (err, project) => {
    if (project === null) {
      data.script = script;
      data.projectId = projectId;
      data.pipelineId = pipelineId;
      data.projectName = projectName;
      data.save();
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  });
});

module.exports = router;