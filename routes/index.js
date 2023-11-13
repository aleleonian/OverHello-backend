const express = require('express');
const router = express.Router();
// TODO: implement cors properly
const cors = require('cors')
const cheerio = require("cheerio");
const { dbFind, dbInsert, dbUpdate } = require("../db/dbOperations");
const { resizeImage } = require("../util/index");
const path = require("path");

const corsOptions = {
  origin: process.env.CORS_HOST,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'OverHello - Backend' });
});

// router.post("/", cors(corsOptions), async function (req, res, next) {
router.post("/", async function (req, res, next) {

  const data = req.body;

  const userName = data.name;

  const userId = generateUserId(userName);

  let response = {};

  response.userId = userId;

  try {

    const insertResult = await dbInsert("users",
      {
        userId: userId,
        userName: userName,
        when: Date.now()
      }
    );

    if (!insertResult.acknowledged || !insertResult.insertedId) {
      console.log("Error inserting user->", error);
      const resObj = {
        success: false
      }
      return res.status(500).json(resObj);
    }

  }
  catch (error) {
    console.log("Error inserting user->", error);
    const resObj = {
      success: false
    }
    return res.status(500).json(resObj);
  }

  let scrapedData = await scrapeNameInfo(userName);

  if (scrapedData) {
    response.scrapedData = scrapedData;
  }

  const equivalentsArray = scrapedData.equivalentsArray;

  delete scrapedData.equivalentsArray;

  let nameWasFound = await dbFind("names", { Name: userName });

  response.name = userName;
  response.success = true;

  if (nameWasFound) response.nameWasFound = true;

  // here we return and we then continue working in the background
  res.status(200).json(response);

  let spreadSheetData = {
    name: userName,
    userId: userId,
    names: equivalentsArray
  }

  // let's generate the spreadsheet in google drive
  response = await fetch(process.env.THIS_SERVER + '/spreadsheet', {
    method: "POST",
    body: JSON.stringify(spreadSheetData),
    headers: { "Content-type": "application/json; charset=UTF-8" }
  });

  let postResponse = JSON.parse(await response.text());

  //we gota record the responseObject.sheetUrl into the db for this user
  if (postResponse.success) {
    const updateResult = await dbUpdate("users", { userId: userId }, { "spreadSheetUrl": postResponse.sheetUrl });
    console.log(updateResult);
  }

  // let's take the snapshot of that spreadsheet
  let snapshotUrl = process.env.THIS_SERVER + "/snapshot/take?userId=" + userId + "&url=" + encodeURIComponent(postResponse.sheetUrl);
  console.log("snapshotUrl->", snapshotUrl)
  response = await fetch(snapshotUrl);
  response = JSON.parse(await response.text());
  if (response.success) {
    await resizeImage(path.resolve(__dirname, "../public/images/" + response.fileName), 400, 300, path.resolve(__dirname, "../public/images/" + response.fileName.replace("-original", "")));

    const updateResult = await dbUpdate("users", { userId: userId }, { "spreadSheetSnapshot": response.fileName });
    // resize the image
    console.log(updateResult);



  }
  else {
    console.log(response.message);
  }
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

    let equivalentsArray = $('#body-inner > div:nth-child(6)').text().trim().split(/\n/);

    equivalentsArray = equivalentsArray.map(entry => entry.replace(/\s+/g, " "));

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