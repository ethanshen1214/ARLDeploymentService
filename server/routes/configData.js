var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/authKey', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).authKey);
    res.status(200).end();
})

router.post('/mongoURL', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).mongoDb);
    res.status(200).end();
})

module.exports = router;