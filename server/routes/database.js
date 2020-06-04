var express = require('express');
const config = require('../../src/lib/config.json');
var mongoose = require('mongoose');
var Data = require('../data');
var router = express.Router();

const dbRoute = 'mongodb+srv://joemama:joemama@cluster0-vh0zy.gcp.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(dbRoute, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));// checks if connection with the database is successful

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
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
    const { projectId, pipelineId, script } = req.body;

    if ((!projectId && projectId !== 0) || !script) {
      return res.json({
        success: false,
        error: 'INVALID INPUTS',
      });
    }
    data.script = script;
    data.projectId = projectId;
    data.pipelineId = pipelineId;
    data.save((err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
});

module.exports = router;