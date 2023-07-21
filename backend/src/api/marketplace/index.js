const express = require('express');
const router = express.Router();
const marketplace = require("./controller");

router.get('/get_item_detail', marketplace.getItemDetail);
router.get('/get_list', marketplace.getList);
router.get('/get_collection_list', marketplace.getCollectionList);
router.get('/get_list_by_collection_name', marketplace.getListByCollectionName);
router.get('/get_list_by_accountid', marketplace.getListByAccountId);
router.get('/check_nft', marketplace.checkNft);

router.post('/set_list', marketplace.setList);
router.post('/cancel_list', marketplace.cancelList);
router.post('/set_favourites', marketplace.setFavourites);
router.post('/unset_favourites', marketplace.unsetFavourites);
router.post('/set_watching', marketplace.setWatching);
router.post('/unset_watching', marketplace.unsetWatching);
router.post('/send_nft', marketplace.sendNft);
router.post('/allowance_nft', marketplace.approveAllowanceNft);

module.exports = router;
