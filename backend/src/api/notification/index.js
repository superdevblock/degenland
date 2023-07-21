const express = require('express');
const router = express.Router();
const notification = require("./controller");

router.get('/get_notification', notification.getNotification);
router.get('/get_invite_state', notification.getInviteState);
router.post('/set_read', notification.setRead);
module.exports = router;
