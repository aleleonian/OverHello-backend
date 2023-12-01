const sharp = require('sharp');
const path = require("path");
const fsPromises = require("fs/promises");
const { emptyCollection, dbFindOne, dbUpdate } = require("./db/dbOperations");
const { deleteAllSpreadsheets } = require("../util/spreadsheets/index");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptyDir(folderPath) {

  return new Promise(async (resolve) => {
    try {
      const files = await fsPromises.readdir(folderPath);
      for (const file of files) {
        await fsPromises.unlink(path.resolve(folderPath, file));
      }
      resolve(true);
    } catch (err) {
      resolve(false);
      console.log(err);
    }
  });
}

function deleteAllVideos() {
  const folderPath = path.resolve(__dirname, "../public/vids");
  return emptyDir(folderPath);
}
function deleteAllPictures() {
  const folderPath = path.resolve(__dirname, "../public/images");
  return emptyDir(folderPath);
}

async function resizeImage(filePath, width, height, newFilePath) {
  try {
    await sharp(filePath)
      .resize({
        width: width,
        height: height
      })
      .toFile(newFilePath);
  } catch (error) {
    console.log(error);
  }
}

async function cropImage(filePath, width, height, top, left, newFilePath) {

  try {
    await sharp(filePath).rotate().extract({ width: width, height: height, left: left, top: top }).toFile(newFilePath)
      .then(function (new_file_info) {
        console.log("Image cropped and saved");
      })
      .catch(function (error) {
        console.log("An error occured->", error);
      });
  }
  catch (error) {
    console.log(error);
  }

}

async function deleteAllUsersAndTheirStuff() {

  try {
    // delete all the entries in the "users" collection
    const emptyOperationResult = await emptyCollection("users");

    // delete all the images in /public/images
    const deleteImagesOperation = await deleteAllPictures();

    // delete all the videos in /public/vids
    const deleteVidsOperation = await deleteAllVideos();

    // TODO this should not be public
    // instead it should be a function inside this file

    // delete all the spreadsheets
    const deleteSpreadsheetsUrl = await deleteAllSpreadsheets();

    // let's update the last purge timestamp
    let configObj = await dbFindOne("configuration", {});

    dbUpdate("configuration", { _id: configObj._id }, { lastPurgeTimeStamp: Date.now() });
  }
  catch (error) {
    console.log("deleteAllUsersAndTheirStuff() error->", error);
  }

}
async function purgeUsers() {

  // TODO: now we need to cron this thing

  // recupera la fecha de the last purge

  let configObj = await dbFindOne("configuration", {});

  // si ya pasaron 24 horas, purgea de nuevo

  if (shouldPurgeUsers(configObj.lastPurgeTimeStamp)) {
    console.log("Purging users!")
    deleteAllUsersAndTheirStuff();
  }
  else {
    console.log("not the time to purge  yet!");
  }

  // sino, no. 

}

function shouldPurgeUsers(lastPurgeTimeStamp) {

  const rightNow = Date.now();

  // Calculate the difference in milliseconds
  const timeDifference = rightNow - lastPurgeTimeStamp;

  const secondsDifference = timeDifference / 1000;
  const minutesDifference = secondsDifference / 60;
  const hoursDifference = Math.round(minutesDifference / 60);

  if (hoursDifference > 24) return true;
  else return false;
}

module.exports = { purgeUsers, wait, resizeImage, deleteAllVideos, deleteAllPictures, cropImage, deleteAllUsersAndTheirStuff };