var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/getAuthKey', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).authKey);
    res.status(200).end();
})

router.post('/getMongoURL', (req,res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).mongoDb);
    res.status(200).end();
})

router.post('/getDownloadPath', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('./config.json')).downloadPath);
    res.status(200).end();
})

router.post('/setAuthKey', (req, res) => {

})

router.post('/setMongoURL', (req, res) => {

})

router.post('/setDownloadPath', (req, res) => {
    
})

module.exports = router;