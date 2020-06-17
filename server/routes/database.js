var express = require('express');
var mongoose = require('mongoose');
var Data = require('../data');
var { mongoDb } = require('../config.json');
var router = express.Router();
var fs = require('fs');

let dbRoute = mongoDb;
  mongoose.connect(dbRoute, { useNewUrlParser: true });
  mongoose.set('useFindAndModify', false);
  let db = mongoose.connection;
  db.once('open', () => console.log('connected to the database'));
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));// checks if connection with the database is successful




router.post('/connect', (req, res) => {
  fs.writeFileSync('./config.json', JSON.stringify({ mongoDb: req.body.url }));
  mongoose.disconnect();
  configFile = fs.readFileSync('./config.json');
  dbRoute = JSON.parse(configFile).mongoDb;
  mongoose.connect(dbRoute, { useNewUrlParser: true });
  mongoose.set('useFindAndModify', false);
  db = mongoose.connection;
  db.once('open', () => console.log('connected to the database'));
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));// checks if connection with the database is successful
  console.log(dbRoute)
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