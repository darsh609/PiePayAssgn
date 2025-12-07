// module.exports = function parseFlipkartOffers(fk) {
//     if (!fk?.paymentOptions?.items) return [];

//     const offerSection = fk.paymentOptions.items.find(
//         x => x.type === "OFFER_LIST"
//     );

//     if (!offerSection) return [];

//     const offerList = offerSection.data.offers.offerList;

//     return offerList.map(o => ({
//         flipkartOfferId: o.offerDescription.id,
//         providerBanks: o.provider?.length ? o.provider : [],
//         paymentInstruments: inferPaymentInstruments(o),
//         type: inferType(o),
//         value: extractValue(o),
//         offerText: o.offerText?.text || "",
//         description: o.offerDescription?.text || ""
//     }));
// };

// function inferPaymentInstruments(o) {
//     // Basic inference from provider
//     if (!o.provider?.length) return ["UPI"]; 
//     if (o.provider.includes("FLIPKARTAXISBANK")) return ["CREDIT"];
//     if (o.provider.includes("FLIPKARTSBI")) return ["CREDIT"];
//     if (o.provider.includes("BAJAJFINSERV")) return ["EMI_OPTIONS"];
//     return [];
// }

// function inferType(o) {
//     return o?.offerDescription?.type || "UNKNOWN";
// }

// function extractValue(o) {
//     const txt = o.offerText?.text || "";
//     const match = txt.match(/₹(\d+)/);
//     return match ? Number(match[1]) : 0;
// }
// src/utils/parseFlipkartOffers.js

function toNumber(n) {
  if (n === undefined || n === null) return 0;
  return Number(String(n).replace(/[^0-9.-]+/g, "")) || 0;
}

function extractCurrencyNumber(text) {
  if (!text) return 0;
  const m = text.match(/₹\s?([\d,]+)/);
  if (m) return Number(m[1].replace(/,/g, ""));
  return 0;
}

// find percent like "10%" or "10 %"
function extractPercent(text) {
  if (!text) return 0;
  const m = text.match(/(\d+(\.\d+)?)\s*%/);
  if (m) return Number(m[1]);
  return 0;
}

// min order like "Min Order Value ₹4,990" or "on orders of ₹9,990 and above"
function extractMinOrder(text) {
  if (!text) return 0;
  const m = text.match(/(?:Min Order Value|Min Booking Amount|orders of|txn value|Txn Value|Min Txn Value)[^\d₹]*₹\s?([\d,]+)/i);
  if (m) return Number(m[1].replace(/,/g, ""));
  // fallback generic
  const m2 = text.match(/₹\s?([\d,]+)\s*(?:and above|and above|and higher|or above)/i);
  if (m2) return Number(m2[1].replace(/,/g, ""));
  return 0;
}

function extractTenure(text) {
  if (!text) return null;
  const m = text.match(/(\d+)\s*(?:months|month|tenure)/i);
  if (m) return Number(m[1]);
  return null;
}

function detectInstruments(offerObj) {
  // heuristics:
  // if provider length === 0 => often UPI / generic -> set UPI
  // if description mentions EMI -> EMI_OPTIONS + CREDIT
  // if provider contains "BAJAJ" -> EMI_OPTIONS
  // if provider contains "AXIS" "SBI" etc -> CREDIT
  const instr = new Set();

  const providers = (offerObj.provider || []).map(p => String(p || "").toUpperCase());
  const desc = (offerObj.offerDescription?.text || "") + " " + (offerObj.offerText?.text || "");

  if (!providers || providers.length === 0) {
    // likely UPI/generic cashback -> treat as UPI/CASHBACK
    instr.add("UPI");
  } else {
    for (const p of providers) {
      if (/BAJAJFINSERV/i.test(p) || /BFL/i.test(p)) instr.add("EMI_OPTIONS");

      if (/AXIS|SBI|ICICI|HDFC|BOB|KOTAK|YESBANK|IDFC|CITI|AMEX|AMERICAN/i.test(p)) {
        // banks support card payments -> classify CREDIT by default
        instr.add("CREDIT");
      }
    }
  }

  // detect EMI words in description
  if (/EMI|emi|No Cost EMI|Insta EMI|InstaEMI/i.test(desc)) {
    instr.add("EMI_OPTIONS");
    instr.add("CREDIT");
  }

  // detect debit-card specific mention (rare)
  if (/Debit Card|Debit/i.test(desc)) instr.add("DEBIT");

  if (instr.size === 0) instr.add("UNKNOWN");

  return Array.from(instr);
}

function parseSingleOffer(o) {
  const id = o.offerDescription?.id || o.id || null;
  const title = o.offerSummary?.title || o.offerText?.text || "";
  const offerText = o.offerText?.text || "";
  const description = o.offerDescription?.text || "";
  const type = o.offerDescription?.type || "";
  const logo = o.logo || "";

  // parse numbers
  const flatFromOfferText = extractCurrencyNumber(offerText);
  const percentFromDesc = extractPercent(description) || extractPercent(offerText);

  const maxFromDesc = (() => {
    // detect "up to ₹X" in description / offerText
    const m = (description + " " + offerText).match(/up to\s*₹\s?([\d,]+)/i);
    
    if (m) return Number(m[1].replace(/,/g, ""));
    // there may be "upto ₹50" (no space)
    const m2 = (description + " " + offerText).match(/upto\s*₹\s?([\d,]+)/i);

    if (m2) return Number(m2[1].replace(/,/g, ""));
    // If the offerText itself is "Save ₹1,000" that's the flat cap for percent offers
    if (percentFromDesc && flatFromOfferText) return flatFromOfferText;

    return 0;
  })();

  const minOrder = extractMinOrder(description) || extractMinOrder(offerText);
  const tenureMonths = extractTenure(description) || extractTenure(offerText);

  // determine discount type: prefer percent if percent present, else flat if flat amount present, else cashback
  let discountType = "UNKNOWN";
  if (percentFromDesc > 0) discountType = "PERCENT";
  else if (flatFromOfferText > 0) discountType = "FLAT";
  else if (/cashback|Cashback|get ₹/i.test(offerText + " " + description)) discountType = "CASHBACK";

  // detect once-per-user
  const isOnce = /Once Per User|Once per user|once per user/i.test(description + " " + offerText);

  const providerBanks = (o.provider || []).map(p => String(p || "").trim()).filter(Boolean);


  const paymentInstruments = detectInstruments(o)
  .map(i => String(i).toUpperCase().trim());
// array

  return {
    flipkartOfferId: id,
    title,
    offerText,
    description,
    type,
    logo,
    providerBanks,
    paymentInstruments,
    discountType,
    flatAmount: flatFromOfferText || 0,
    percentage: percentFromDesc || 0,
    maxDiscount: maxFromDesc || 0,
    minOrderValue: minOrder || 0,
    tenureMonths: tenureMonths || null,
    isOncePerUser: isOnce,
    frequencyLimitText: o.offerDescription?.tncText || null,
    rawOfferObject: o
  };
}

module.exports = function parseFlipkartOffers(fkResponse) {
  if (!fkResponse || !fkResponse.paymentOptions || !fkResponse.paymentOptions.items) return [];

  const offerSection = fkResponse.paymentOptions.items.find(it => it.type === "OFFER_LIST");
  if (!offerSection) return [];

  const list = offerSection.data?.offers?.offerList || [];
  const parsed = [];

  for (const o of list) {
    try {
      const p = parseSingleOffer(o);
      // skip if no id
      if (!p.flipkartOfferId) continue;
      parsed.push(p);
    } catch (e) {
      // continue on parse errors but log
      console.error("parseFlipkartOffers error", e);
    }
  }

  return parsed;
};
