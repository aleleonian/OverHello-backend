const sharp = require('sharp');

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

module.exports = { wait, resizeImage };