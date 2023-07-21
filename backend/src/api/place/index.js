const express = require('express');
const router = express.Router();
const place = require("./controller");

router.get('/get_place_info', place.getPlaceInfo);
router.get('/get_places_info', place.getPlacesInfoFromNft);
router.get('/update_place_info', place.updatePlaceInfo);
router.get('/get_current_visitor', place.getcurrentVisitor);
router.get('/get_place_info_by_name', place.getPlaceInfoByName);
router.get('/get_famous_place', place.getFamousPlace);

router.post('/decrease_visitor', place.decreaseVisitor);
router.post('/set_place_info', place.setPlaceInfo);
module.exports = router;
