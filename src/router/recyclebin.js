const express = require("express");
const { getAllRecyclebin } = require("../component/recyclebin");
const router = express.Router();
router.get("/recyclebin", getAllRecyclebin);

module.exports = router;