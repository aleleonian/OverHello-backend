const express = require('express');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const sheetUrl = process.env.SHEETS_URL;

router.post("/", async (req, res) => {

    console.log("We're being hit!");

    let data = req.body;
    //TODO this data should be stringified apparently
    console.log(JSON.stringify(data));
    if (data.name && data.names) {
        try {
            let responseObject = await createSpreadSheet(data.name, data.names);
            if (responseObject.success) res.status(200).write("OK!");
            else res.status(200).write("NOT OK!");
        }
        catch (error) {
            console.log("/spreadsheet error: ", error.message);
            res.status(200).write("NOT OK!");
        }
    }
    else {
        res.status(200).write("NOT OK! - need name && names");
    }
    res.end();

});

async function createSpreadSheet(name, equivalentArray) {
    let responseObject = {};

    try {
        const serviceAccountAuth = new JWT({
            email: process.env.SHEETS_EMAIL,
            key: process.env.SHEETS_KEY,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const doc = new GoogleSpreadsheet('1VS0qw5cvPcOhOUp_qvLnwAjLtVw3TJrunubbPihEyZQ', serviceAccountAuth);

        await doc.loadInfo();

        // first determine which the name for the new sheet will be
        let sheets = doc.sheetsByTitle;

        let desiredTitle = name;

        let newTitle = desiredTitle;

        let counter = 0;

        while (sheets[newTitle]) {
            counter++;
            newTitle = desiredTitle + "-" + counter;
        }

        const newSheet = await doc.addSheet({ title: newTitle, headerValues: ['Nationality', 'Equivalent'] });

        await newSheet.addRows(prepareEquivalentArray(equivalentArray));

        responseObject.success = true;

        responseObject.sheetUrl = sheetUrl + "#gid=" + await findSheetId(newTitle, doc);
    }
    catch (error) {
        responseObject.success = false;
    }
    return responseObject;

}

async function findSheetId(targetSheet, doc) {
    let sheets = await doc.sheetsByTitle;
    return sheets[targetSheet].sheetId;
}
function prepareEquivalentArray(equivalentArray) {

    let spreadsheetObjectsArray = [];

    equivalentArray.forEach(equivalent => {
        let equivalentObj = {};
        if (equivalent.indexOf(",") > -1) {
            let nameArray = equivalent.split(",");
            const name = getName(nameArray[0]);
            const nationality = getNationality(nameArray[0], name);
            equivalentObj.Nationality = nationality;
            equivalentObj.Equivalent = name;
            for (let i = 1; i < nameArray.length; i++) {
                equivalentObj.Equivalent += ", " + nameArray[i];
            }

        }
        else {
            const name = getName(equivalent);
            const nationality = getNationality(equivalent, name);
            equivalentObj.Nationality = nationality;
            equivalentObj.Equivalent = name;

        }
        spreadsheetObjectsArray.push(equivalentObj);
    })

    return spreadsheetObjectsArray;

    function getName(string) {
        return string.substring(string.lastIndexOf(" ") + 1, string.length);
    }
    function getNationality(string, name) {
        return string.substring(0, string.indexOf(name) - 1);
    }
}

module.exports = router;

