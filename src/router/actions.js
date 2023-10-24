const express = require("express");
const { actions, getAllactions } = require("../controller/actions");
const router = express.Router();
router.post("/action", actions);
router.get("/getallaction", getAllactions);
module.exports = router;