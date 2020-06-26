const express = require('express');
const Data = require('../bin/launch');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
    if(mongooseConnection) {
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
      const { projectName, update } = req.body;
      Data.findOneAndUpdate( {projectName: projectName}, update, (err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
      });
  });
    
  // this is our delete method
  // this method removes existing data in our database
  router.delete('/deleteData', (req, res) => {
      const { projectName } = req.body;
      Data.findByIdAndRemove(projectName, (err) => {
        if (err) return res.send(err);
        return res.json({ success: true });
      });
  });
    
  // this is our create method
  // this method adds new data in our database
  router.post('/putData', (req, res) => {
    let data = new Data();
    const{ name, startScript, stopScript, path } = req.body;
    Data.findOne( {name}, (err, project) => {
      if (project === null) {
        data.projectName = name;
        data.startScript = startScript;
        data.stopScript = stopScript;
        data.path = path;
        data.save();
        return res.json({ success: true });
      } else {
        return res.json({ success: false });
      }
    });
  });

module.exports = router;