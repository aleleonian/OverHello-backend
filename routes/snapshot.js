const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();
const path = require("path");
const { wait } = require("../util/index");

router.get('/take', async (req, res) => {

    const url = decodeURIComponent(req.query.url);
    const userId = req.query.userId;

    console.log("url->", url);
    console.log("userId->", userId);

    if (url && userId) {
        const fileName = userId + "-snapshot-original.jpg";

        const filePath = path.resolve(__dirname, `../public/images/${fileName}`);

        let missionAccomplished = await takeSnapShot(url, filePath);

        let resObj;

        if (missionAccomplished) {
            resObj = {
                success: true,
                fileName: fileName
            }
        }
        else {
            resObj = {
                success: false,
            }
        }
        res.status(200).json(resObj);

    }
    else {
        let resObj = {
            success: false,
            message: "NEED URL & USERID"
        }
        res.status(200).json(resObj);
    }
});

async function takeSnapShot(url, filePath) {

    try {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto(url,
            { waitUntil: ['networkidle2'] });

        await page.screenshot({ path: filePath });

        await browser.close();

        return true;
    }
    catch (error) {
        console.log("takeSnapShot()->", error);
        return false;
    }
}


module.exports = router;