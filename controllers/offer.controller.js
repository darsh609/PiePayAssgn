const Offer = require("../models/offer.model");
const parseFlipkartOffers = require("../utils/parseFlipkartOffers");

exports.storeOffers = async (req, res) => {
    try {
        const fk = req.body.flipkartOfferApiResponse;
        console.log("RECEIVED FK DATAAAA",fk);
        const offers = parseFlipkartOffers(fk);

        let newOffers = 0;

        for (const offer of offers) {
            const exists = await Offer.findOne({ flipkartOfferId: offer.flipkartOfferId });
            if (!exists) {
                await Offer.create(offer);
                newOffers++;
            }
        }

        return res.json({
            noOfOffersIdentified: offers.length,
            noOfNewOffersCreated: newOffers
        });

    } catch (err) {
        console.error("ERROR IN storeOffers:");
        return res.status(500).json({ error: err.message });
    }
};
