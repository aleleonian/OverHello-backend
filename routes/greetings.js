const express = require('express');
const router = express.Router();
const { dbGetARandomGreeting } = require("../util/db/dbOperations");

router.get('/random', async function (req, res, next) {
    const randomGreeting = await dbGetARandomGreeting();
    res.status(200).write(randomGreeting);
    res.end();
});

module.exports = router;
