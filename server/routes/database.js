var express = require('express');
var mongoose = require('mongoose');
var Data = require('../data');
var { mongoDb } = require('../config.json');
var router = express.Router();
var fs = require('fs');

let dbRoute = mongoDb;

mongoose.connect(dbRoute, { useNewUrlParser: true }).catch(error => console.log('MongoDB URL not set.'));
mongoose.set('useFindAndModify', false)
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
db.on('error', () => {
  db.removeAllListeners();
  db.close();
});// checks if connection with the database is successful

router.post('/config', (req, res) => {
  
  oldConfigFile = fs.readFileSync('./config.json');
  oldKey = JSON.parse(oldConfigFile).authKey;
  oldUrl = JSON.parse(oldConfigFile).mongoDb;

  if(req.body.authKey === '' && req.body.url !== ''){   //no auth key input
    
    fs.writeFileSync('./config.json', JSON.stringify({ authKey: oldKey, mongoDb: req.body.url }));
    console.log('here')
    mongoose.disconnect();
    
    mongoose.connect(req.body.url, { useNewUrlParser: true }).catch(() => console.log('MongoDB URL invalid.'));
    mongoose.set('useFindAndModify', false);
    db = mongoose.connection;
    db.once('open', () => console.log('connected to the database'));
    db.on('error', () => {
      db.removeAllListeners();
      db.close();
    }); // checks if connection with the database is successful
  }
  else if(req.body.authKey !== '' && req.body.url === ''){  //no url input
    fs.writeFileSync('./config.json', JSON.stringify({ authKey: req.body.authKey, mongoDb: oldUrl }));
  }
  else if(req.body.authKey !== '' && req.body.url !== ''){  //both inputs
    fs.writeFileSync('./config.json', JSON.stringify({ authKey: req.body.authKey, mongoDb: req.body.url }));
    mongoose.disconnect();
    mongoose.connect(req.body.url, { useNewUrlParser: true }).catch(() => console.log('MongoDB URL invalid.'));
    mongoose.set('useFindAndModify', false);
    db = mongoose.connection;
    db.once('open', () => console.log('connected to the database'));
    db.on('error', () => {
      db.removeAllListeners();
      db.close();
    }); // checks if connection with the database is successful
  }
  res.status(200).end();
})

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});
router.post('/getOne', (req, res) => {
  const { projectId } = req.body;
  Data.findOne({projectId: projectId}, (err, data) => {
    if(err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  })
});
  
  // this is our update method
  // this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
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
  
  // this is our create methid
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