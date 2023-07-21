const express = require('express');
const router = express.Router();
const soldnftlist = require("./controller");

router.get('/get_sold_list', soldnftlist.getSoldList);

module.exports = router;
