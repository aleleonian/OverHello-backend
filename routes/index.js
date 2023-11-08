const express = require('express');
const router = express.Router();
const cors = require('cors')
const axios = require("axios");
const cheerio = require("cheerio");

const corsOptions = {
  origin: process.env.CORS_HOST,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

console.log(corsOptions);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/", async function (req, res, next) {
  // router.post("/", cors(corsOptions), async function (req, res, next) {
  const data = req.body;
  let response = {};

  let nameData = await scrapeNameInfo(data.name);

  if (nameData) {
    response.nameData = nameData;
  }

  const mongoClient = req.app.locals.mongoClient;

  const ohDb = mongoClient.db('OverHello');

  const namesCollection = ohDb.collection('names');

  let nameWasFound = await namesCollection.findOne({ Name: data.name });

  response.name = data.name;
  if (nameWasFound) response.nameWasFound = true;

  res.status(200).json(response);
})
module.exports = router;


async function scrapeNameInfo(name) {

  try {

    let url = `https://www.behindthename.com/name/${name}`;
    const response = await axios.get(url);

    // Get the HTML code of the webpage 
    const html = response.data;

    const $ = cheerio.load(html);

    const nameData = $('.namedef').text();

    console.log(nameData);

    return nameData;

  } catch (error) {
    console.log("Error fetching name data->", error);
    return false;
  }
}