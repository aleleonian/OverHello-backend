const express = require('express');
const router = express.Router();
const cors = require('cors')
const cheerio = require("cheerio");
const { dbSetClient, dbFind, dbInsert, dbSetName } = require("../db/dbOperations");

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

  const data = req.body;

  const userName = data.name;

  const userId = generateUserId(userName);

  console.log("userId->" + userId);

  // router.post("/", cors(corsOptions), async function (req, res, next) {

  dbSetClient(req.app.locals.mongoClient);

  dbSetName(process.env.DB_NAME);

  console.log("before founduser");

  const foundUser = await dbFind("users", { userId: userId });

  console.log("foundUser->" + foundUser);

  if (!foundUser) {
    try {

      const insertResult = await dbInsert("users", { userId: userId, userName: userName });

      console.log("insertResult->" + JSON.stringify(insertResult));

    }
    catch (error) {
      console.log("Error inserting user->", error);
    }
  }
  else {
    console.log("User was already in the db!");
  }

  let response = {};

  let scrapedData = await scrapeNameInfo(userName);

  if (scrapedData) {
    response.scrapedData = scrapedData;
  }

  const equivalentsArray = scrapedData.equivalentsArray;

  delete scrapedData.equivalentsArray;

  let nameWasFound = await dbFind("names", { Name: userName });

  response.name = userName;
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

    // console.log("first query->", html);

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

    scrapedData.equivalentsArray = equivalentsArray
  }
  catch (error) {
    console.log("Error fetching equivalent data->", error);
    scrapedData.equivalent = null;
  }

  return scrapedData;

}

function generateUserId(name) {
  return name.split("").reduce(function (previousValue, currentValue) {
    return currentValue.charCodeAt(0) + Date.now();
  }, 0);
}