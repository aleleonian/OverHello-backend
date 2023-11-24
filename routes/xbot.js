var express = require('express');
var router = express.Router();
const XBot = require("../classes/XBot");

let statusCode = 200;

router.get('/init', async function (req, res, next) {
    let responseObject = {};

    if (!req.app.locals.myXBot) {
        req.app.locals.myXBot = new XBot();
        await req.app.locals.myXBot.init();

        responseObject.success = true;
        responseObject.message = "OK!"
    }
    else {
        responseObject.success = false;
        responseObject.message = "Already initiated."
    }
    res.status(200).json(responseObject);
});

//TODO this is not working
router.get('/close', function (req, res, next) {
    let responseObject = {};
    console.log("req.app.locals.myXBot->", req.app.locals.myXBot);
    if (!req.app.locals.myXBot) {
        responseObject.success = false;
        responseObject.message = "Not initiated."
        res.status(301).json(responseObject);
    }
    else {
        try {
            req.app.locals.myXBot.browser.close();
            req.app.locals.myXBot = null;
            responseObject.success = true;
            responseObject.message = "Bot closed."
            res.status(200).json(responseObject);
        }
        catch (error) {
            console.log("Error!->", error);
            responseObject.success = false;
            responseObject.message = "Could not close bot."
            res.status(301).json(responseObject);
        }
    }
});
router.get('/geturl', async function (req, res, next) {
    let responseObject = {};

    if (!req.app.locals.myXBot) {
        responseObject.success = false;
        responseObject.message = "Not initiated."
        res.status(301).json(responseObject);
    }
    else {
        try {
            const url = req.app.locals.myXBot.getUrl();
            responseObject.success = true;
            responseObject.url = url;
            res.status(200).json(responseObject);
        }
        catch (error) {
            console.log("Error!->", error);
            responseObject.success = false;
            responseObject.message = "Could not close bot."
            res.status(301).json(responseObject);
        }
    }
});

router.get('/goto', async function (req, res, next) {

    console.log("req.app.locals.myXBot->", req.app.locals.myXBot);

    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.url) {
            const urlToVisit = req.query.url;
            const isVisiting = await req.app.locals.myXBot.goto(urlToVisit);
            responseObject.success = isVisiting;
            if (isVisiting) {
                responseObject.message = "Bot visiting " + urlToVisit;
                statusCode = 200;
            }
            else {
                responseObject.message = "Bot NOT visiting";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No URL?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});

router.get('/tweet', async function (req, res, next) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.text) {
            const text = req.query.text;
            const hasTweeted = await req.app.locals.myXBot.tweet(text);
            responseObject.success = hasTweeted;
            if (hasTweeted) {
                responseObject.message = "Bot tweeted!";
                statusCode = 200;
            }
            else {
                responseObject.message = "Bot did NOT tweet";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No TEXT?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.get('/lastposturl', async function (req, res, next) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const lastTweetUrl = await req.app.locals.myXBot.getLastTweetUrl();
        if (lastTweetUrl) {
            responseObject.message = "Got last tweet's url";
            statusCode = 200;
            responseObject.url = lastTweetUrl;
        }
        else {
            responseObject.message = "Did not get last tweet's url";
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }
    return res.status(statusCode).json(responseObject);

});

router.get('/login', async function (req, res, next) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const hasLoggedIn = await req.app.locals.myXBot.loginToX();
        responseObject.success = hasLoggedIn;
        if (hasLoggedIn) {
            let confirmedSuspicion = await req.app.locals.myXBot.twitterSuspects();
            if (confirmedSuspicion) {
                let emailWasInput = await req.app.locals.myXBot.inputEmail();

                if (emailWasInput) {
                    responseObject.message = "Bot logged in!";
                    statusCode = 200;
                }
                else {
                    responseObject.message = "Bot did NOT log in";
                    statusCode = 301;
                }
            }
            else {
                responseObject.message = "Bot logged in!";
                statusCode = 200;
            }

        }
        else {
            responseObject.message = "Bot did NOT log in";
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});

router.post('/findtype', async function (req, res, next) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const data = req.body;

        if (data && data.target && data.text) {
            const isSuccess = await req.app.locals.myXBot.findAndType(data.target, data.text);
            responseObject.success = isSuccess;
            if (isSuccess) {
                responseObject.message = "Found and typed";
                statusCode = 200;
            }
            else {
                responseObject.message = "Not found and/or typed";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "Needed target and text!"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.post('/findclick', async function (req, res, next) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const data = req.body;

        if (data && data.target) {
            const isSuccess = await req.app.locals.myXBot.findAndClick(data.target);
            responseObject.success = isSuccess;
            if (isSuccess) {
                responseObject.message = "Found and clicked!";
                statusCode = 200;
            }
            else {
                responseObject.message = "Not found and/or clicked!";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "Needed target!"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.post('/gettext', async function (req, res, next) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const data = req.body;

        if (data && data.target) {
            const isSuccess = await req.app.locals.myXBot.findAndGetText(data.target);
            responseObject.success = isSuccess.success;
            if (isSuccess) {
                responseObject.message = "Found and got text!";
                responseObject.text = isSuccess.text;
                statusCode = 200;
            }
            else {
                responseObject.message = "Not found and/or got text!";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "Needed target!"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});

module.exports = router;
