var express = require('express');
var router = express.Router();
var cors = require('cors')

var corsOptions = {
  origin: process.env.CORS_HOST,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/", cors(corsOptions), function (req, res, next) {
  console.log(req.body);
  const data = req.body;
  res.sendStatus(200);
})
module.exports = router;
