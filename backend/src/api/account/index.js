const express = require('express');
const router = express.Router();
const account = require("./controller");

router.get('/check_login', account.checkLogin);
router.get('/get_player', account.getPlayerInfo);
router.get('/get_player_by_id', account.getPlayerInfoById);
router.get('/get_allplayer', account.getAllPlayerInfo);
router.get('/get_friendlist', account.getFriendList);
router.get('/calculate_level', account.calculateLevel);
router.get('/update_player_info', account.updatePlayerInfo);
router.get('/get_player_nft_count', account.getPlayerNftCount);

router.post('/create_new_player', account.createNewPlayer);
router.post('/upload_avatar', account.uploadAvatar);
router.post('/set_friend', account.setFriend);
router.post('/set_nft_count', account.setNftCount);
router.post('/logout', account.logout);
router.post('/goto_view', account.goToView);
router.post('/edit_playerId', account.editPlayerId);

module.exports = router;
