
const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  flipkartOfferId: { type: String, required: true, unique: true }, // FPO...
  title: String,               // e.g. "10% instant discount"
  offerText: String,           // e.g. "Save ₹1,000" or "Get ₹15 cashback"
  description: String,         // tnc / long text
  type: String,                // original type from flipkart e.g. "tenure.detail.offer.terms.conditions"
  logo: String,

  // Providers / payment instruments as arrays (normalised uppercase)
  providerBanks: [String],     // e.g. ["SBI","FLIPKARTSBI"]
  paymentInstruments: [String],// e.g. ["CREDIT","EMI_OPTIONS","UPI"]

  // Parsed discount fields (these are the important fields for calc)
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



// const mongoose = require("mongoose");

// const offerSchema = new mongoose.Schema({
//     flipkartOfferId: { type: String, unique: true, required: true },
//     providerBanks: [String],           // ex: ["AXIS"], ["SBI"], []
//     paymentInstruments: [String],      // ex: ["UPI", "CREDIT", "EMI_OPTIONS"]
//     type: String,                      // CASHBACK_ON_CARD, INSTANT_DISCOUNT, etc.
//     value: Number,                     // numeric discount value from Flipkart API
//     offerText: String,                 // “Get 5% cashback”
//     description: String                // T&C text
// });

// module.exports = mongoose.model("Offer", offerSchema);

//  "items": [{
//                         "type": "OFFER_LIST",
//                         "data": {
//                             "offerSummary": {
//                                 "title": "10% instant discount",
//                                 "subTitle": "Claim now with payment offers",
//                                 "iconsInfo": {
//                                     "remainingOffersCount": 3,
//                                     "icons": ["/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/generic_bank.svg", "https://static-assets-web.flixcart.com/apex-static/images/payments/upi/paytm-logo.svg"]
//                                 }
//                             },
//                             "offers": {
//                                 "headerTitle": "Offers on online payment",
//                                 "offerList": [{
//                                     "provider": [],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/generic_bank.svg",
//                                     "offerText": {
//                                         "text": "Get ₹15 cashback"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251128153220CWNA9",
//                                         "text": "Flat ₹15 Cashback on MobiKwik UPI Transaction. Min Order Value ₹499. Offer Valid Once Per User"
//                                     }
//                                 }, {
//                                     "provider": [],
//                                     "logo": "https://static-assets-web.flixcart.com/apex-static/images/payments/upi/paytm-logo.svg",
//                                     "offerText": {
//                                         "text": "Get ₹10 cashback"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO2512041835171GNZ7",
//                                         "text": "Flat ₹10 Cashback on Paytm UPI payments. Min Order Value ₹99. Valid once per Paytm account"
//                                     }
//                                 }, {
//                                     "provider": [],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/green-offer-tag.svg",
//                                     "offerText": {
//                                         "text": "Get ₹50 cashback"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251128181820XE8LC",
//                                         "text": "Up To ₹50 Cashback on BHIM Payments App. Min Order Value ₹199. Offer Valid Once Per User"
//                                     }
//                                 }, {
//                                     "provider": ["SBI", "FLIPKARTSBI"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/green-offer-tag.svg",
//                                     "offerText": {
//                                         "text": "Save ₹1,000"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO2512021741591ZHIA",
//                                         "text": "10% off up to ₹1,000 on SBI Credit Card EMI Transactions of ₹4,990 and above"
//                                     }
//                                 }, {
//                                     "provider": ["SBI"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/SBI.svg",
//                                     "offerText": {
//                                         "text": "Save ₹750"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251202173727AX8RQ",
//                                         "text": "10% off up to ₹750 on SBI Credit Card Transactions of ₹4,990 and above"
//                                     }
//                                 }, {
//                                     "provider": ["FLIPKARTBAJAJFINSERV"],
//                                     "logo": "/FK_STATIC_ASSET/apex-static/images/payments/banks/BFL_V3.svg",
//                                     "offerText": {
//                                         "text": "Save ₹100"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251003233042PW3P9",
//                                         "text": "Flat ₹100 off on Flipkart Bajaj Finserv Insta EMI Card. Min Booking Amount: ₹7,500"
//                                     }
//                                 }, {
//                                     "provider": ["FLIPKARTAXISBANK"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/AXIS.svg",
//                                     "offerText": {
//                                         "text": "Get 5% cashback"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO2509161258586WXGR",
//                                         "text": "5% cashback on Flipkart Axis Bank Credit Card upto ₹4,000 per statement quarter"
//                                     }
//                                 }, {
//                                     "provider": ["FLIPKARTSBI"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/SBI.svg",
//                                     "offerText": {
//                                         "text": "Get 5% cashback"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251103123615YLG67",
//                                         "text": "5% cashback on Flipkart SBI Credit Card upto ₹4,000 per calendar quarter"
//                                     }
//                                 }, {
//                                     "provider": ["ICICI"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/ICICI.svg",
//                                     "offerText": {
//                                         "text": "Save ₹1,250"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251121183502WIYOE",
//                                         "text": "10% off on ICICI Credit Card EMI Transactions, up to ₹1250 on orders of ₹9,990 and above"
//                                     }
//                                 }, {
//                                     "provider": ["HDFC"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/HDFC.svg",
//                                     "offerText": {
//                                         "text": "Save ₹750"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251129151010Y58HZ",
//                                         "text": "10% Off Up to ₹750 on HDFC Bank Credit Card EMI on 6 months and above tenure . Min. Txn Value: ₹4990"
//                                     }
//                                 }, {
//                                     "provider": ["FLIPKARTBAJAJFINSERV"],
//                                     "logo": "/FK_STATIC_ASSET/apex-static/images/payments/banks/BFL_V3.svg",
//                                     "offerText": {
//                                         "text": "Save ₹50"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO2510032323329BAXV",
//                                         "text": "Flat ₹50 off on Flipkart Bajaj Finserv Insta EMI Card. Min Booking Amount: ₹2,500"
//                                     }
//                                 }, {
//                                     "provider": ["FLIPKARTAXISBANK"],
//                                     "logo": "/FK_STATIC_ASSET/fk-p-linchpin-web/fk-gringotts/images/banks/AXIS.svg",
//                                     "offerText": {
//                                         "text": "Get 5% cashback"
//                                     },
//                                     "offerDescription": {
//                                         "type": "tenure.detail.offer.terms.conditions",
//                                         "tncText": "Terms and conditions",
//                                         "id": "FPO251202142455KPD9T",
//                                         "text": "5% cashback on Axis Bank Flipkart Debit Card up to ₹750"
//                                     }
//                                 }],