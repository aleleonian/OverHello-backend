const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();
const path = require("path");

router.get('/take', async (req, res) => {

    const url = req.query.url;

    if (url) {
        const fileName = Date.now() + "-snapshot.jpg";

        const filePath = path.resolve(process.cwd(), `public/images/${fileName}`);

        let missionAccomplished = await takeSnapShot(url, filePath);

        res.status(200).write(missionAccomplished ? "OK!->" + fileName : "NOT OK!");

        res.end();
    }
    else {
        res.status(200).write("NO URL?");
        res.end();
    }
});

async function takeSnapShot(url, filePath) {

    try {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--start-maximized', // you can also use '--start-fullscreen'
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