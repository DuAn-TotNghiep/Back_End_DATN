const express = require("express");
const { getAllRecyclebin, RestoreProduct, RemoveProductRecyclebin } = require("../controller/recyclebin");
const router = express.Router();
router.get("/recyclebin", getAllRecyclebin);
router.post("/recyclebin/:id/restore", RestoreProduct);
router.delete("/recyclebin/:id", RemoveProductRecyclebin);



module.exports = router;