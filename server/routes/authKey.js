var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).authKey);
    res.status(200).end();
})

module.exports = router;