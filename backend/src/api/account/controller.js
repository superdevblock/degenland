const { createHash } = require('crypto');
const sharp = require('sharp');
const sortJsonArray = require('sort-json-array');

const Account = require('../../models/Account');
const NftList = require('../../models/NftList');
const Place = require('../../models/Place');

exports.checkLogin = async (req_, res_) => {
    try {
        const _accountId = req_.query.accountId;

        //check login
        const accountData = await Account.findOne({ accountId: _accountId });
        if (accountData.loginState == true)
            return res_.send({ result: false, error: 'Already logined in!' });

        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.createNewPlayer = async (req_, res_) => {
    console.log("uploadName log - 1 : ", req_.body);

    const c_accountId = req_.body.accountId;
    const c_playerId = req_.body.playerId;
    const c_avatarName = req_.body.avatarName;
    const c_phaserAvatarName = req_.body.phaserAvatarName;
    const c_walletInfo = req_.body.walletInfo;

    const c_findAccountId = await Account.find({ accountId: c_accountId });
    console.log("uploadName log - 2 : ", c_findAccountId);

    if (c_findAccountId?.length > 0)
        return res_.send({ result: false, error: "This account is already registered!" });

    if (c_playerId.length > 15)
        return res_.send({ result: false, error: "This player Id' max length is 15 character!" });

    const c_findPlayerId = await Account.find({ playerId: c_playerId });
    console.log("uploadName log - 3 : ", c_findPlayerId);

    if (c_findPlayerId?.length > 0)
        return res_.send({ result: false, error: "This player Id is already used!" });

    const c_newPlayerData = new Account({
        accountId: c_accountId,
        playerId: c_playerId,
        avatarUrl: "/avatars/" + c_avatarName,
        phaserAvatarUrl: "/avatars/" + c_phaserAvatarName,
        degenlandCount: c_walletInfo.degenlandCount,
        tycoonCount: c_walletInfo.tycoonCount,
        mogulCount: c_walletInfo.mogulCount,
        investorCount: c_walletInfo.investorCount
    });

    const c_insertNewResult = await c_newPlayerData.save();
    console.log("uploadName log - 4 : ", c_insertNewResult)
    if (!c_insertNewResult)
        return res_.send({ result: false, error: "Something wrong with creating" });

    return res_.send({ result: true, data: c_insertNewResult });
}

exports.setNftCount = async (req_, res_) => {
    console.log("setNftCount log - 1 : ", req_.body);
    try {
        const _accountId = req_.body.accountId;
        const _nftCount = req_.body.NftCount;

        await Account.findOneAndUpdate(
            { accountId: _accountId },
            {
                degenlandCount: _nftCount.degenlandCount,
                tycoonCount: _nftCount.tycoonCount,
                mogulCount: _nftCount.mogulCount,
                investorCount: _nftCount.investorCount
            }
        );
        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.uploadAvatar = async (req_, res_) => {
    console.log("uploadAvatar log - 1 : ", req_.files);
    try {
        if (!req_.files) {
            console.log("uploadAvatar log - 2");
            res_.send({
                result: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let u_avatar = req_.files.avatar;

            let u_nameList = u_avatar.name.split(".");
            let u_ext = u_nameList[u_nameList.length - 1];
            let u_preHashStr = u_avatar.name + Date.now();
            const u_hashStr = createHash('sha1').update(u_preHashStr).digest('hex');
            const u_newName = u_hashStr + "." + u_ext;

            //Use the mv() method to place the file in the upload directory (i.e. "uploads")
            await u_avatar.mv(`./uploads/avatars/` + u_newName);

            await sharp(`./uploads/avatars/` + u_newName).resize(128, 128).toFile(`./uploads/avatars/` + u_newName.split('.')[0] + '_phaser.png', (err, info) => { });

            //send response
            res_.send({
                result: true,
                data: {
                    name: u_newName,
                    phaser_name: u_newName.split('.')[0] + '_phaser.png',
                    mimetype: u_avatar.mimetype,
                    size: u_avatar.size
                }
            });
        }
    } catch (err) {
        res_.send({
            result: false,
            message: 'Something wrong.'
        });
    }
}

exports.setFriend = async (req_, res_) => {
    console.log("setFriend", req_.body.id1, req_.body.id2);
    const fromAccountId = req_.body.id1;
    const toAccountId = req_.body.id2;

    const oldfromAccount = await Account.findOne({ accountId: fromAccountId });
    oldfromAccount.friendList.push(toAccountId);

    // Manage level
    // let level = oldfromAccount.level;
    // let nextLevel = oldfromAccount.nextLevel;
    // let currentLevelScore = oldfromAccount.currentLevelScore;
    // let targetLevelScore = oldfromAccount.targetLevelScore;
    // currentLevelScore += 10;
    // if (currentLevelScore >= targetLevelScore) {
    //     level++;
    //     nextLevel++;
    //     currentLevelScore -= targetLevelScore;
    //     targetLevelScore += 500;
    // }

    await Account.findOneAndUpdate(
        { accountId: fromAccountId },
        {
            friendList: oldfromAccount.friendList,
            // level: level,
            // nextLevel: nextLevel,
            // currentLevelScore: currentLevelScore,
            // targetLevelScore: targetLevelScore
        },
        { new: true }
    );

    const oldtoAccount = await Account.findOne({ accountId: toAccountId });
    oldtoAccount.friendList.push(fromAccountId);

    // Manage level
    // level = oldtoAccount.level;
    // nextLevel = oldtoAccount.nextLevel;
    // currentLevelScore = oldtoAccount.currentLevelScore;
    // targetLevelScore = oldtoAccount.targetLevelScore;
    // currentLevelScore += 10;
    // if (currentLevelScore >= targetLevelScore) {
    //     level++;
    //     nextLevel++;
    //     currentLevelScore -= targetLevelScore;
    //     targetLevelScore += 500;
    // }

    const toAccount = await Account.findOneAndUpdate(
        { accountId: toAccountId },
        {
            friendList: oldtoAccount.friendList,
            // level: level,
            // nextLevel: nextLevel,
            // currentLevelScore: currentLevelScore,
            // targetLevelScore: targetLevelScore
        },
        { new: true }
    );

    if (!toAccount)
        return res_.send({ result: false, error: "Something wrong to set friend" });

    return res_.send({ result: true, data: toAccount });
}

exports.getPlayerInfo = async (req_, res_) => {
    console.log("getPlayerInfo log - 1 : ", req_.query);

    const g_accountId = req_.query.accountId;

    const g_findAccountId = await Account.findOne({ accountId: g_accountId });
    console.log("getPlayerInfo log - 2 : ", g_findAccountId);

    if (!g_findAccountId)
        return res_.send({ result: false, error: "This account is not registered!" });

    return res_.send({ result: true, data: g_findAccountId });
}

exports.getPlayerInfoById = async (req_, res_) => {
    try {
        const _playerId = atob(req_.query.playerId);
        const _myAccountId = atob(req_.query.myAccountId);

        const _playerInfo = await Account.findOne({ playerId: _playerId });

        if (!_playerInfo)
            return res_.send({ result: false, error: "This player is not registered!" });
        const _myInfo = await Account.findOne({ accountId: _myAccountId });
        for (let i = 0;i < _myInfo.friendList.length;i++) {
            if (_playerInfo.accountId == _myInfo.friendList[i])
                return res_.send({ result: false, error: "This player is already your friend!" });
        }
        return res_.send({ result: true, data: _playerInfo.accountId });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getPlayerNftCount = async (req_, res_) => {
    console.log("getPlayerNftCount log - 1 : ", req_.query);
    try {
        const g_accountId = req_.query.accountId;

        const g_accountInfo = await Account.findOne({ accountId: g_accountId });

        const resData = {
            degenlandCount: g_accountInfo.degenlandCount,
            tycoonCount: g_accountInfo.tycoonCount,
            mogulCount: g_accountInfo.mogulCount,
            investorCount: g_accountInfo.investorCount
        };

        if (!g_accountInfo)
            return res_.send({ result: false, error: "This account is not registered!" });
        return res_.send({ result: true, data: resData });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getFriendList = async (req_, res_) => {
    const g_accountId = req_.query.accountId;
    const g_searchStr = req_.query.searchStr;
    const g_sortType = req_.query.sortType;

    const g_accountData = await Account.findOne({ accountId: g_accountId });

    let friendList = [];
    for (let i = g_accountData.friendList.length - 1; i >= 0; i--) {
        let friendData = undefined;
        if (g_searchStr == '')
            friendData = await Account.findOne({ accountId: g_accountData.friendList[i] });
        else
            friendData = await Account.findOne({ accountId: g_accountData.friendList[i], playerId: { $regex: g_searchStr } });
        if (friendData != null)
            friendList.push(friendData);
    }

    let _sortedFriendList = [];
    if (g_sortType != 'none') {
        sortJsonArray(friendList, 'playerId', g_sortType);
        _sortedFriendList = friendList;
    }
    else {
        _sortedFriendList = friendList.sort((a, b) => b.loginState - a.loginState);
    }

    return res_.send({ result: true, data: _sortedFriendList });
}

exports.getAllPlayerInfo = async (req_, res_) => {
    const allAccount = await Account.find({});
    if (!allAccount)
        return res_.send({ result: false, error: "There is no player!" });

    return res_.send({ result: true, data: allAccount });
}

exports.updatePlayerInfo = async (req_, res_) => {
    const g_accountId = req_.query.accountId;
    const playerInfo = await Account.findOne({ accountId: g_accountId });
    return res_.send({ result: true, data: playerInfo });
}

exports.calculateLevel = async (req_, res_) => {
    const g_accountId = req_.query.accountId;

    const playerInfo = await Account.findOne({ accountId: g_accountId });
    let level = 1;
    let nextLevel = 2;
    let targetLevelScore = 500;
    let totalLevelScore = playerInfo.totalLevelScore;
    let nftHolderScore = playerInfo.degenlandCount*2000 + playerInfo.investorCount*250;
    let placesScore = 0;
    // calculate place score
    const nftlist = await NftList.find({ owner: playerInfo.accountId });

    for (let i = 0; i < nftlist.length; i++) {
        const placeInfo = await Place.findOne({ token_id: nftlist[i].token_id, serialNumber: nftlist[i].serial_number });
        totalLevelScore += placeInfo.score;
        placesScore += placeInfo.score;
    }

    // calculate friend info
    for (let i = 0; i < playerInfo.friendList.length; i++) {
        totalLevelScore += 5;
    }
    let currentLevelScore = totalLevelScore + nftHolderScore;

    while (targetLevelScore <= currentLevelScore) {
        level++;
        nextLevel++;
        currentLevelScore -= targetLevelScore;
        targetLevelScore += 500;
    }

    const newPlayerInfo = await Account.findOneAndUpdate(
        { accountId: g_accountId },
        {
            level: level,
            nextLevel: nextLevel,
            currentLevelScore: currentLevelScore,
            targetLevelScore: targetLevelScore,
            nftHolderScore: nftHolderScore,
            placesScore: placesScore
        },
        { new: true }
    );

    return res_.send({ result: true, data: newPlayerInfo });
}

exports.logout = async (req_, res_) => {
    try {
        const _accountId = req_.body.accountId;
        await Account.findOneAndUpdate(
            { accountId: _accountId },
            {
                address: '',
                targetPos: '',
                x: 0,
                y: 0,
                n: 0,
                m: 0,
                socketId: '',
                connectState: false,
                loginState: false
            }
        );
        return res_.send({ result: true, data: 'success' });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.goToView = async (req_, res_) => {
    try {
        const _accountId = req_.body.accountId;

        const playerInfo = await Account.findOne({ accountId: _accountId });

        let place = await Place.findOne({ address: playerInfo.address, pos: playerInfo.targetPos });
        if (place) {
          await Place.findOneAndUpdate(
            { address: place.address, pos: place.pos },
            { currentVisitor: place.currentVisitor-1 }
          );
        }

        await Account.findOneAndUpdate(
            { accountId: _accountId },
            {
                buildingInsideInfo: {
                    buildingId: "",
                    x: 0,
                    y: 0,
                    n: 0,
                    m: 0,
                    isIn: false
                }
            }
        );
        return res.send({ result: true, data: 'success' });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.editPlayerId = async (req_, res_) => {
    try {
        const _oldUsername = req_.body.oldUsername;
        const _newUsername = req_.body.newUsername;

        const _playerData = await Account.findOneAndUpdate(
            { playerId: _oldUsername },
            { playerId: _newUsername },
            { new: true }
        );
        return res_.send({ result: true, accountId: _playerData.accountId, msg: 'success' });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}
