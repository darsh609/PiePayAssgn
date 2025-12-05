const express = require("express");
const router = express.Router();
const { getHighestDiscount } = require("../controllers/discount.controller");

router.get("/highest-discount", getHighestDiscount);
module.exports = router;
