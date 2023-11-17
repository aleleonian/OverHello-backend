var express = require('express');
var router = express.Router();
const { dbFind } = require("../db/dbOperations");

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

module.exports = router;
