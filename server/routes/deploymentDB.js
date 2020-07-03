const express = require('express');
const Data = require('../bin/data');
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

router.post('/getOne', (req, res) => {
  console.log(req.body);
  Data.findOne({ projectId: req.body.projectId }, (err, project) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: project })
  })
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