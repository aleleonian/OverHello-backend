const express = require('express');
const router = express.Router();

const { deleteAllSpreadsheets, createSpreadSheet } = require("../util/spreadsheets/index");

router.get("/delete/all", async function (req, res) {
    try {
        let responseObject = await deleteAllSpreadsheets();
        res.status(200).json(responseObject);

    }
    catch (error) {
        console.log("/spreadsheet/delete/all error: ", error.message);
        let resObj = {};
        resObj.success = false;
        resObj.message = error.message;
        res.status(200).json(resObj);
    }

})
router.post("/", async (req, res) => {

    let data = req.body;
    //TODO this data should be stringified apparently
    if (data.name && data.names) {
        try {
            let responseObject = await createSpreadSheet(data.name, data.names);
            res.status(200).json(responseObject);

        }
        catch (error) {
            console.log("/spreadsheet error: ", error.message);
            let resObj = {};
            resObj.success = false;
            resObj.message = error.message;
            res.status(200).json(resObj);
        }
    }
    else {
        let resObj = {};
        resObj.success = false;
        resObj.message = "need name && names";
        res.status(200).json(resObj);
    }
});


module.exports = router;

