var express = require('express');
var router = express.Router();
const { dbFindOne, emptyCollection, dbUpdate } = require("../util/db/dbOperations");
const { deleteAllUsersAndTheirStuff } = require("../util/index");

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
        let userFound = await dbFindOne("users", { userId: Number(userId) });
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
            const resObj = {
                success: true
            }
            await deleteAllUsersAndTheirStuff();
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
