var express = require('express');
var router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const path = require("path");
//whatthehell
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
                        res.status(200).json("OK!");
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

function doConcat([...name], dir) {

    return new Promise((resolve, reject) => {

        const outPath = `../public/vids/${name.join("")}.mp4`;

        if (!name || !dir) {
            console.log("Incomplete arguments!");
            resolve(false);
        }
        try {
            const inputList = name.map(char => path.resolve(`${dir}/${char}.mp4`));

            const chainedInputs = inputList.reduce((result, inputItem) => result.addInput(inputItem), ffmpeg());

            let errorHappened;

            chainedInputs
                .on('end', function () {
                    console.log('files have been merged succesfully');
                })
                .on('error', function (err) {
                    console.log('an error happened: ' + err.message);
                    errorHappened = true;
                })
                .mergeToFile(outPath);

            if (errorHappened) {
                resolve(false);
                return;
            }
            console.log("Video file created!");
            resolve(true);
        }
        catch (error) {
            console.log("doConcat() error->", error);
            resolve(false);
        }
    });

}
