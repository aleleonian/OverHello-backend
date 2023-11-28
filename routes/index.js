const express = require('express');
const router = express.Router();
// const cors = require('cors')
const cheerio = require("cheerio");
const { dbFind, dbInsert, dbUpdate } = require("../db/dbOperations");
const { resizeImage, wait } = require("../util/index");
const path = require("path");



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'OverHello - Backend' });
});

// router.post("/", cors(), async function (req, res, next) {
router.post("/", async function (req, res, next) {

  const data = req.body;

  const userName = data.name;

  const userId = generateUserId(userName);

  let response = {};

  response.userId = userId;

  try {

    // 1) create the user in teh db
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

  // 2) scrape the site
  let scrapedData = await scrapeNameInfo(userName);

  console.log("scrapedData->", scrapedData);

  if (scrapedData) {
    response.scrapedData = scrapedData;
  }

  const equivalentsArray = scrapedData.equivalentsArray;

  delete scrapedData.equivalentsArray;

  // 3) check our db looking for that name
  let nameWasFound = await dbFind("names", { Name: userName });

  response.name = userName;
  response.success = true;

  if (nameWasFound) response.nameWasFound = true;

  // 4) here we return and we then continue working in the background
  res.status(200).json(response);

  // 5) let's generate the spreadsheet in google drive
  // if there's
  if (scrapedData && equivalentsArray) {
    spreadSheetStuff(userName, userId, equivalentsArray)
  }
  // 7) generate the tweet
  // should check if the server is alive and logged in
  tweet(userName, userId);
});

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

    console.log("nameData->", nameData);

    if (nameData.length == 0 || nameData == "") {
      return false;
    }
    else if (nameData.length > 500) {
      nameData = nameData.substring(0, 497) + "...";
    }
    scrapedData.nameData = nameData;

    console.log("scrapedData.nameData->", scrapedData.nameData);

  } catch (error) {
    console.log("Error fetching name data->", error);
    return false;
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

async function tweet(userName, userId) {
  response = await fetch(process.env.XBOT_SERVER + "/xbot/ping");
  response = JSON.parse(await response.text());
  if (!response.success) {
    //somehow indicate in the db there's no tweeter action for this user.
    return noTweetForThisUser();
  }
  else {
    // check if the xBot is logged in, otherwise log it in.
    response = await fetch(process.env.XBOT_SERVER + "/xbot/isloggedin");
    response = JSON.parse(await response.text());
    if (!response.success) {
      await fetch(process.env.XBOT_SERVER + "/xbot/init");
      response = await fetch(process.env.XBOT_SERVER + "/xbot/login");
      response = JSON.parse(await response.text());
      if (!response.success) {
        return noTweetForThisUser();
      }
    }
    //TODO this tweet sometimes fails!
    response = await fetch(process.env.XBOT_SERVER + "/xbot/tweet?text=" + encodeURIComponent("Hello " + userName + "! How are you?") + "&userId=" + userId);
    response = JSON.parse(await response.text());
    if (response.success) {
      //now we got to retrieve the last url's tweet
      response = await fetch(process.env.XBOT_SERVER + "/xbot/lastposturl");
      response = JSON.parse(await response.text());
      if (response.url) {
        const tweetUrl = response.url;
        dbUpdate("users", { userId: userId }, { "tweet": tweetUrl });
        tweetSnapshot(userId, response.url);
      }
      else return noTweetForThisUser();
    }
    else {
      if (response.message.indexOf("xBot is busy") > -1) {
        console.log("xBot is busy, will wait.")
        // this means the bot is busy and will eventually have the tweet ready
        let counter = 0;
        let tweetUrl;
        while (counter < 10) {
          await wait(10000);
          response = await fetch(process.env.XBOT_SERVER + "/xbot/gettweet?userId=" + userId);
          response = await response.text();
          response = JSON.parse(response);
          if (response.url) {
            tweetUrl = response.url;
            break;
          }
          counter++
        }
        if (tweetUrl) {
          dbUpdate("users", { userId: userId }, { "tweetUrl": tweetUrl });
          tweetSnapshot(userId, tweetUrl);
        }
        else {
          return noTweetForThisUser();
        }
      }
      else {
        return noTweetForThisUser();
      }
    }
  }

  function noTweetForThisUser() {
    dbUpdate("users", { userId: userId }, { "tweetUrl": false })
  }

  async function tweetSnapshot(userId, tweetUrl) {
    let snapshotUrl = process.env.THIS_SERVER + "/snapshot/take?userId=" + userId + "&url=" + encodeURIComponent(tweetUrl) + "&prefix=tweet";
    console.log("snapshotUrl->", snapshotUrl);
    response = await fetch(snapshotUrl);
    response = JSON.parse(await response.text());
    if (response.success) {
      const updatedFilePath = response.fileName.replace("-original", "");
      await resizeImage(path.resolve(__dirname, "../public/images/" + response.fileName), 400, 300, path.resolve(__dirname, "../public/images/" + updatedFilePath));
      await dbUpdate("users", { userId: userId }, { "tweetSnapshot": updatedFilePath });
    }
    else {
      console.log(response.message);
    }

  }
}

async function spreadSheetStuff(userName, userId, equivalentsArray) {

  let spreadSheetData = {
    name: userName,
    userId: userId,
    names: equivalentsArray
  }
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
  else {
    console.log("Error generating spreadsheet!->", postResponse.message)
  }

  // 6) let's take the snapshot of that spreadsheet
  let snapshotUrl = process.env.THIS_SERVER + "/snapshot/take?userId=" + userId + "&url=" + encodeURIComponent(postResponse.sheetUrl) + "&prefix=spreadsheet";
  console.log("snapshotUrl->", snapshotUrl)
  response = await fetch(snapshotUrl);
  response = JSON.parse(await response.text());
  if (response.success) {
    const modifiedFilePath = response.fileName.replace("-original", "");
    await resizeImage(path.resolve(__dirname, "../public/images/" + response.fileName), 400, 300, path.resolve(__dirname, "../public/images/" + modifiedFilePath));
    const updateResult = await dbUpdate("users", { userId: userId }, { "spreadSheetSnapshot": modifiedFilePath });
    // resize the image
    console.log(updateResult);
  }
  else {
    console.log(response.message);
  }
}