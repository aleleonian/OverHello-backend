const sharp = require('sharp');
const path = require("path");
const fsPromises = require("fs/promises");

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
    await sharp(filePath).extract({ width: width, height: height, left: left, top: top }).toFile(newFilePath)
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
module.exports = { wait, resizeImage, deleteAllVideos, deleteAllPictures , cropImage};