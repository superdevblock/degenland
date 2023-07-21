const express = require('express');
const router = express.Router();
const nft = require("./controller");

router.get('/get_nftData', nft.getNFTData);

router.post('/set_nft', nft.setNft);
router.post('/add_nft_list', nft.addNftList);
module.exports = router;
