const express = require('express');
const router = express.Router();
const cors = require('cors')
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
  let scrapedData = {};

  try {

    let url = `https://www.behindthename.com/name/${name}`;

    let response = await fetch(url);

    // Get the HTML code of the webpage 
    let html = await response.text();

    console.log("first query->", html);

    let $ = cheerio.load(html);

    let nameData = $('.namedef').text();

    if (nameData.length > 500) {
      nameData = nameData.substring(0, 497) + "...";
    }
    scrapedData.nameData = nameData;

  } catch (error) {
    console.log("Error fetching name data->", error);
    scrapedData.nameData = null;
  }
  try {
    url = `https://www.behindthename.com/name/${name}/related`;

    response = await fetch(url);

    // Get the HTML code of the webpage 
    html = await response.text();

    $ = cheerio.load(html);

    let equivalentsArray = $('#body-inner > div:nth-child(6)').text().trim().split(/\n/)

    scrapedData.equivalent = equivalentsArray[Math.floor(Math.random() * equivalentsArray.length)];

    console.log(JSON.stringify(scrapedData));

  }
  catch (error) {
    console.log("Error fetching equivalent data->", error);
    scrapedData.equivalent = null;
  }

  return scrapedData;


}