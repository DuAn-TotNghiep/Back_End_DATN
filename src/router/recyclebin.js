const express = require("express");
const { getAllRecyclebin, RestoreProduct } = require("../component/recyclebin");
const router = express.Router();
router.get("/recyclebin", getAllRecyclebin);
router.post("/recyclebin/:id", RestoreProduct);


module.exports = router;