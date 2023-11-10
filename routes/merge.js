var express = require('express');
var router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const path = require("path");

//TODO: setTimeOut delete the videos

router.get('/', async function (req, res, next) {

    const dir = path.resolve(__dirname, "../morse");

    if (req.query) {
        const params = req.query;
        let name = params['name'];
        if (name) {
            const outPath = path.resolve(__dirname, `../public/vids/${name}.mp4`);
            name = name.split("");
            try {
                const inputList = name.map(char => path.resolve(`${dir}/${char}.mp4`));

                const chainedInputs = inputList.reduce((result, inputItem) => result.addInput(inputItem), ffmpeg());

                chainedInputs
                    .on('end', function () {
                        console.log('files have been merged succesfully');
                        res.status(200).write("OK!");
                        res.end();
                    })
                    .on('error', function (error) {
                        console.log('an error happened: ' + error.message);
                        res.status(200).write("error->" + error.message);
                        res.end();
                    })
                    .mergeToFile(outPath);
            }
            catch (error) {
                res.status(200).write("error->" + error.message);
                res.end();
            }
        }
    }

});

module.exports = router;
