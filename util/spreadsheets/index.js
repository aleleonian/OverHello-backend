const sheetUrl = process.env.SHEETS_URL;
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

function connectToGoogleDrive() {
    return new Promise((resolve) => {
        try {
            const serviceAccountAuth = new JWT({
                email: process.env.SHEETS_EMAIL,
                key: JSON.parse(process.env.SHEETS_KEY),
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                ],
            });
            resolve(serviceAccountAuth);
        }
        catch (error) {
            resolve(false);
        }
    })
}

async function deleteAllSpreadsheets() {
    try {
        const serviceAccountAuth = await connectToGoogleDrive();
        const doc = new GoogleSpreadsheet(process.env.SHEETS_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheetsById = await doc.sheetsById;
        Object.keys(sheetsById).forEach(async sheetId => {
            console.log(sheetId);
            if (sheetId != "2062785254") {
                await doc.deleteSheet(sheetId);
            }
            else return;
        });
        let responseObject = {};
        responseObject.success = true;
        return responseObject;
    }
    catch (error) {
        console.log(error);
        let responseObject = {};
        responseObject.success = false;
        return responseObject;
    }
}
async function createSpreadSheet(name, equivalentArray) {
    let responseObject = {};

    try {
        const serviceAccountAuth = await connectToGoogleDrive();

        const doc = new GoogleSpreadsheet(process.env.SHEETS_ID, serviceAccountAuth);

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
        responseObject.message = error.message;
        console.log(error)
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

module.exports = {connectToGoogleDrive, deleteAllSpreadsheets, createSpreadSheet}