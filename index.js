

const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const offerRoutes = require("./routes/offer.routes");
const discountRoutes = require("./routes/discount.routes");

const app = express();
app.use(express.json({ limit: '15mb' }));

const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI

mongoose.connect(MONGO)
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch(err => {
    console.error('mongo connect failed', err);
    process.exit(1);
  });




app.use("/", offerRoutes);
app.use("/", discountRoutes);