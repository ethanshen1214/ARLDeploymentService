var express = require('express');
const downloads = require('./downloads');
var deployments = downloads.deployed;
var router = express.Router();

router.get('/', (req, res, next) => {
    res.send(deployments);
    //console.log(JSON.stringify(deployments));
})

module.exports = router;