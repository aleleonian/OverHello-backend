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

router.post("/", cors(corsOptions), async function (req, res, next) {
  console.log(req.body);
  const data = req.body;
  // res.sendStatus(200);

  const mongoClient = req.app.locals.mongoClient;

  const ohDb = mongoClient.db('OverHello');

  const namesCollection = ohDb.collection('names');

  let nameWasFound = await namesCollection.findOne({ Name: data.name });

  let response = {};
  response.name = data.name;
  if (nameWasFound) response.nameWasFound = true;

  res.status(200).json(response);
})
module.exports = router;
