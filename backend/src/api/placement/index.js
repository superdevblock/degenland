const express = require('express');
const router = express.Router();
const placement = require("./controller");

router.get('/get_id', placement.getId);
router.get('/get_ticket', placement.getTicket);
router.get('/get_url', placement.getUrl);

router.post('/setLinkUrl', placement.setLinkUrl);
router.post('/set_ticket', placement.setTicket);
router.post('/upload_advertisement', placement.uploadAdvertisement);
module.exports = router;
