const express = require('express');
const router = express.Router();
const nftSwapOffer = require("./controller");

router.get('/get_offer', nftSwapOffer.getOffer);
router.get('/get_swapid', nftSwapOffer.getSwapId);
router.get('/get_offer_list', nftSwapOffer.getOfferList);
router.get('/get_token', nftSwapOffer.getToken);
router.get('/get_claim_state', nftSwapOffer.getClaimState);
router.get('/get_offer_state', nftSwapOffer.getOfferState);

router.post('/edit_offer', nftSwapOffer.editOffer);
router.post('/update_offer', nftSwapOffer.updateOffer);
router.post('/set_claim_state', nftSwapOffer.setClaimState);
module.exports = router;
