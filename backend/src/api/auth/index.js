const express = require('express');
const router = express.Router();
const auth = require("./controller");

router.get('/load_user', auth.loadUser);

router.post('/login', auth.login);
module.exports = router;
