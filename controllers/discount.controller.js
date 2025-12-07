
const Offer = require("../models/offer.model");

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

    const bankRegex = new RegExp(bankName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    // build query
    const query = {
   
      providerBanks: { $elemMatch: { $regex: bankRegex } }
    };

    if (paymentInstrument) {
      
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
  } 
  else if (dt === "FLAT" || dt === "CASHBACK") {
    discount = flat;
  } 
  else {
 
    discount = flat || Number(offer.value || 0) || 0;
  }

 
  if (!isFinite(discount) || discount < 0) discount = 0;

  return Math.floor(discount);
}
