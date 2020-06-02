var express = require('express');
const deployed = require('./downloads').deployed;
var router = express.Router();

router.get('/', (req, res, next) => {
    res.send(deployed);
})

module.exports = router;