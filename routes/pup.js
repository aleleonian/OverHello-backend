const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {

    const url = req.query.url;

    console.log("url->", url);

    if (url) {
        let missionAccomplished = await takeSnapShot(url);
        res.status(200).write(missionAccomplished ? "OK!" : "NOT OK!");
        res.end();
    }
    else {
        res.status(200).write("NO URL?");
        res.end();
    }
});

async function takeSnapShot(url) {

    try {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--start-maximized', // you can also use '--start-fullscreen'
                '--no-sandbox'
            ]
        });

        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto(url,
            { waitUntil: ['domcontentloaded'] });

        await page.screenshot({ path: `./snapshot.jpg` });

        await browser.close();

        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}


function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;