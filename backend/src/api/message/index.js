const express = require('express');
const router = express.Router();
const message = require("./controller");

router.get('/get_message_list', message.getMessageList);

module.exports = router;
