const express = require('express');
const router = express.Router();
const buyBuilding = require("./controller");

router.get('/get_state', buyBuilding.getState);

module.exports = router;
