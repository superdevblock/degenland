const express = require('express');
const router = express.Router();
const auctions = require("./controller");

router.get('/get_list', auctions.getList);
router.get('/check_nft', auctions.checkNft);
router.get('/get_item_detail', auctions.getItemDetail);
router.get('/get_list_by_accountid', auctions.getListByAccountId);

router.post('/set_list', auctions.setList);
router.post('/cancel_list', auctions.cancelList);
router.post('/allowance_nft', auctions.approveAllowanceNft);
router.post('/send_nft', auctions.sendNft);

module.exports = router;
