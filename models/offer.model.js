
const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  flipkartOfferId: { type: String, required: true, unique: true }, 
  title: String,               
  offerText: String,          
  description: String,         
  type: String,                
  logo: String,

  
  providerBanks: [String],     
  paymentInstruments: [String],

  
  discountType: { type: String, enum: ["FLAT","PERCENT","CASHBACK","UNKNOWN"], default: "UNKNOWN" },
  flatAmount: { type: Number, default: 0 },      // absolute like 1000, 15, 50
  percentage: { type: Number, default: 0 },      // percent (like 10 for 10%)
  maxDiscount: { type: Number, default: 0 },     // cap like ₹1000
  minOrderValue: { type: Number, default: 0 },   // min order value to apply
  tenureMonths: { type: Number, default: null },// if EMI tenure mentioned

  // Extra metadata
  isOncePerUser: { type: Boolean, default: false },
  frequencyLimitText: String,
  rawOfferObject: { type: mongoose.Schema.Types.Mixed }, // store original payload chunk
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Offer", OfferSchema);

