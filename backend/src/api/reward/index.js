const express = require('express');
const router = express.Router();
const reward = require("./controller");

router.get('/get_state', reward.getClaimState);
router.get('/get_reward_amount', reward.getRewardAmount);

router.post('/claim_request', reward.claimRequest);
router.post('/set_state', reward.setClaimState);

module.exports = router;
