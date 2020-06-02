var express = require('express');
const { spawn } = require('child_process');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Handles POST to route */
router.post('/', function(req, res, next) {
  spawn('sh', ['zip.sh'], {cwd: './downloadScripts'});
  res.status(200).end();
});

module.exports = router;
