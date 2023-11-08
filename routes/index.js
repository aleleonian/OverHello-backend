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

  let scrapedData = await scrapeNameInfo(data.name);

  if (scrapedData) {
    response.scrapedData = scrapedData;
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

    let scrapedData = {};

    let url = `https://www.behindthename.com/name/${name}`;

    let response = await axios.get(url);

    // Get the HTML code of the webpage 
    let html = response.data;

    let $ = cheerio.load(html);

    const nameData = $('.namedef').text();

    scrapedData.nameData = nameData;

    url = `https://www.behindthename.com/name/${name}/related`;

    response = await axios.get(url);

    // Get the HTML code of the webpage 
    html = response.data;

    $ = cheerio.load(html);

    let equivalentsArray = $('#body-inner > div:nth-child(6)').text().trim().split(/\n/)

    scrapedData.equivalent = equivalentsArray[Math.floor(Math.random() * equivalentsArray.length)];

    console.log(JSON.stringify(scrapedData));

    return scrapedData;

  } catch (error) {
    console.log("Error fetching name data->", error);
    return false;
  }
}