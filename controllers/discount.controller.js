// // // const Offer = require("../models/offer.model");

// // // exports.getHighestDiscount = async (req, res) => {
// // //     try {
// // //         const { amountToPay, bankName, paymentInstrument } = req.query;

// // //         const offers = await Offer.find({
// // //             providerBanks: bankName,
// // //             paymentInstruments: paymentInstrument
// // //         });

// // //         if (!offers.length)
// // //             return res.json({ highestDiscountAmount: 0 });

// // //         let best = 0;

// // //         for (const o of offers) {
// // //             best = Math.max(best, calculateDiscount(o, amountToPay));
// // //         }

// // //         return res.json({ highestDiscountAmount: best });

// // //     } catch (err) {
// // //         return res.status(500).json({ error: err.message });
// // //     }
// // // };

// // // function calculateDiscount(offer, amount) {
// // //     return offer.value || 0;
// // // }

// // const Offer = require("../models/offer.model");

// // exports.getHighestDiscount = async (req, res) => {
// //     try {
// // const amountToPay = Number(req.query.amountToPay);
// //         const bankName = req.query.bankName?.toUpperCase().trim();
// //         const paymentInstrument = req.query.paymentInstrument?.toUpperCase().trim();

// //         // Build query
// //         const query = {
// //             providerBanks: { $in: [bankName] }
// //         };

// //         if (paymentInstrument) {
// //             query.paymentInstruments = { $in: [paymentInstrument] };
// //         }

// //         console.log("QUERY :", query);

// //         const offers = await Offer.find(query);

// //         console.log("FOUND OFFERS :", offers);

// //         if (!offers.length) {
// //             return res.json({ highestDiscountAmount: 0 });
// //         }


// //         let best = 0;

// //         // Step 2: Loop through offers & compute discount
// //         for (const o of offers) {
// //             const discount = calculateDiscount(o, amountToPay);
// //             if (discount > best) best = discount;
// //         }

// //         return res.json({ highestDiscountAmount: best });

// //     } catch (err) {
// //         return res.status(500).json({ error: err.message });
// //     }
// // };


// // // ==========================
// // // DISCOUNT CALCULATOR
// // // ==========================

// // function calculateDiscount(offer, amountToPay) {
// //     // Case 1: If offerText contains something like "Save ₹1000"
// //     if (offer.offerText) {
// //         const match = offer.offerText.match(/₹\s?([\d,]+)/);
// //         if (match) {
// //             return parseInt(match[1].replace(/,/g, ""));
// //         }
// //     }

// //     // Case 2: If offer.value itself is the discount
// //     if (offer.value && offer.value > 0) return offer.value;

// //     return 0;
// // }

// const Offer = require("../models/offer.model");

// exports.getHighestDiscount = async (req, res) => {
//     try {
//         const amountToPay = Number(req.query.amountToPay);
//         const bankName = req.query.bankName?.toUpperCase().trim();
//         const paymentInstrument = req.query.paymentInstrument?.toUpperCase()?.trim();

//         // Build query
//         const query = {
//           providerBanks: { $regex: bankName, $options: "i" }

//         };

//         if (paymentInstrument) {
//             query.paymentInstruments = { $in: [paymentInstrument] };
//         }

//         console.log("QUERY:", query);

//         const offers = await Offer.find(query);
//         console.log("FOUND OFFERS:", offers);

//         if (!offers.length)
//             return res.json({ highestDiscountAmounttt: 0 });

//         let best = 0;

//         for (const offer of offers) {
//             const discount = calculateDiscount(offer, amountToPay);
//             if (discount > best) best = discount;
//         }

//         return res.json({ highestDiscountAmount: best });

//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };


// // =====================
// // DISCOUNT CALCULATOR
// // =====================
// function calculateDiscount(offer, amountToPay) {
//     // Question requirement: USE offer.value as the discount
//     return offer.value ?? 0;
// }



// controllers/discount.controller.js
const Offer = require("../models/offer.model");

/**
 * GET /highest-discount
 * Query params:
 *  - amountToPay (required)
 *  - bankName (required)
 *  - paymentInstrument (optional)
 */
exports.getHighestDiscount = async (req, res) => {
  try {
    // validate + normalize
    const rawAmount = req.query.amountToPay;
    const rawBank = req.query.bankName;
    const rawPI = req.query.paymentInstrument;

    if (!rawAmount || !rawBank) {
      return res.status(400).json({ error: "amountToPay and bankName are required" });
    }

    const amountToPay = Number(String(rawAmount).replace(/[, ]+/g, "")); // accept "1,900,000"
    if (Number.isNaN(amountToPay) || amountToPay < 0) {
      return res.status(400).json({ error: "invalid amountToPay" });
    }

    const bankName = String(rawBank).trim();
    const paymentInstrument = rawPI ? String(rawPI).toUpperCase().trim() : null;

    // build provider regex for substring (case-insensitive)
    const bankRegex = new RegExp(bankName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    // build query
    const query = {
      // using $elemMatch with $regex ensures we match array entries that contain the substring
      providerBanks: { $elemMatch: { $regex: bankRegex } }
    };

    if (paymentInstrument) {
      // offer.paymentInstruments is an array of strings (normalized to uppercase during save)
      query.paymentInstruments = { $in: [paymentInstrument] };
    }

    // fetch matching offers
    const offers = await Offer.find(query).lean();

    if (!offers || offers.length === 0) {
      return res.json({ highestDiscountAmount: 0 });
    }

    // calculate best discount
    let best = 0;

    for (const offer of offers) {
      const candidate = calculateDiscountForOffer(offer, amountToPay);
      if (candidate > best) best = candidate;
    }

    return res.json({ highestDiscountAmount: Math.floor(best) }); // floor to rupee integer
  } catch (err) {
    console.error("getHighestDiscount err:", err);
    return res.status(500).json({ error: err.message });
  }
};


/**
 * Calculate discount for a single offer (based on structured fields saved in DB)
 * Rules:
 *  - If minOrderValue exists, offer applies only when amountToPay >= minOrderValue
 *  - PERCENT: discount = amountToPay * percentage/100, capped by maxDiscount if provided
 *  - FLAT or CASHBACK: discount = flatAmount
 *  - If discountType UNKNOWN: try flatAmount, then fallback to 'value' if present
 */
function calculateDiscountForOffer(offer, amountToPay) {
  // normalize numeric fields (defensive)
  const flat = Number(offer.flatAmount || 0);
  const pct = Number(offer.percentage || 0);
  const cap = Number(offer.maxDiscount || 0);
  const minOrder = Number(offer.minOrderValue || 0);

  // check min order
  if (minOrder > 0 && amountToPay < minOrder) {
    return 0;
  }

  let discount = 0;

  const dt = (offer.discountType || "").toUpperCase();

  if (dt === "PERCENT") {
    if (pct <= 0) {
      // no percent info — fallback to flat
      discount = flat;
    } else {
      discount = (amountToPay * pct) / 100;
      if (cap && cap > 0) discount = Math.min(discount, cap);
    }
  } else if (dt === "FLAT" || dt === "CASHBACK") {
    discount = flat;
  } else {
    // fallback: prefer flatAmount, else try raw 'value' (older code)
    discount = flat || Number(offer.value || 0) || 0;
  }

  // defensive: ensure non-negative
  if (!isFinite(discount) || discount < 0) discount = 0;

  // Round down to nearest integer rupee (assignment doesn't require cents)
  return Math.floor(discount);
}
