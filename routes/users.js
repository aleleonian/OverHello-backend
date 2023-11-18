var express = require('express');
var router = express.Router();
const { dbFind, emptyCollection } = require("../db/dbOperations");
const { deleteAllVideos, deleteAllPictures } = require("../util/index");

router.get("/get", async function (req, res) {

    const userId = req.query.userId;

    if (!userId) {
        let resObj = {
            success: false,
            message: "NEED USERID"
        }
        res.status(200).json(resObj);
    }
    else {
        let userFound = await dbFind("users", { userId: Number(userId) });
        let resObj = {
            success: true,
            ...userFound
        }
        res.status(200).json(resObj);
    }

});

router.get("/delete", async function (req, res) {
    const userId = req.query.userId;
    if (userId == "*") {
        try {
            // delete all the entries in the "users" collection
            const emptyOperationResult = await emptyCollection("users");
            // delete all the images in /public/images
            const deleteImagesOperation = await deleteAllPictures();
            // delete all the videos in /public/vids
            const deleteVidsOperation = await deleteAllVideos();
            // delete all the spreadsheets
            let deleteSpreadsheetsUrl = process.env.THIS_SERVER + "/spreadsheet/delete/all";
            const response = await fetch(deleteSpreadsheetsUrl);
            const resObj = {
                success: true
            }
            res.status(200).json(resObj);
        }
        catch (error) {
            const resObj = {
                success: false
            }
            res.status(200).json(resObj);

        }
    }
})
module.exports = router;
