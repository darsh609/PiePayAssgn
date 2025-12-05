const express = require("express");
const router = express.Router();
const { storeOffers } = require("../controllers/offer.controller");

router.post("/offer", storeOffers);
module.exports = router;
