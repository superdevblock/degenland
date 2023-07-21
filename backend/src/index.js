const express = require('express');
const app = express();
//const https = require("https");
const http = require("http");
const fs = require("fs");
const cors = require('cors');
const { Server } = require('socket.io');
const { createHash } = require('crypto');

const api = require("./api");
const env = require("./config/env");

//timer action
const timerAction = require('./timerAction');

//socket
const dbInit = require('./socket_io/dbInit');

//db
const db = require('./config/db');
const Place = require('./models/Place');
const Placement = require('./models/Placement');
const Building = require('./models/Building');
const Account = require('./models/Account');
const Notification = require('./models/Notification');
const PrivateMessage = require('./models/PrivateMessage');
const OfferList = require('./models/OfferList');
const Furniture = require('./models/Furniture');
const BuyBuildingHistory = require('./models/BuyBuildingHistory');
const PalTokenSaleHistory = require('./models/PalTokenSaleHistory');
const RewardInfo = require('./models/RewardInfo');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const path = require("path");

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use("/api", api);
app.use(express.static(path.resolve('uploads')));

app.use('/images', express.static('uploads'));

// DB connect
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

const server = http.createServer(app);

// const httpsPort = 3306;
// const privateKey = fs.readFileSync("/etc/letsencrypt/live/degenland.tech/privkey.pem");
// const certificate = fs.readFileSync("/etc/letsencrypt/live/degenland.tech/fullchain.pem");

// const credentials = {
//   key: privateKey,
//   cert: certificate,
// }

// const server = https.createServer(credentials, app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

/**
 * db init
 */
console.log("---------------init data------------------");
dbInit.init();

// let interval = setInterval(async () => {
//   console.log("timer!!");
//   // scan buybuilding history
//   const failedBuyBuildingResult = await BuyBuildingHistory.find({ status: 'send pal error' });
//   timerAction.buyBuilding(failedBuyBuildingResult);

//   // scan PalTokenSale History
//   const failedPalTokenSaleResult = await PalTokenSaleHistory.find({ $or: [{ status: 'hbar transfer error' }, { status: 'pal transfer error' }] });
//   timerAction.buyPalToken(failedPalTokenSaleResult);
// }, 300000);

// reward
// let now = new Date();
// console.log(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0));
// console.log(now);
// var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0) - now;
/*var millisTill10 = 5000;
console.log(millisTill10);

setInterval(async () => {
  millisTill10 -= 1000;
  if (millisTill10 < 0) {
    millisTill10 += 86400000;

    // reward at 9am!
    console.log("It's 12am EST!");
    //clear broadcast notification
    await Notification.deleteMany({ isBroadcast: true });
    //clear reward db
    await RewardInfo.deleteMany({});

    const _accountInfo = await timerAction.updateAccountLevel();
    let _rewardAmount = await timerAction.getTotalRewardAmount();

    if (_rewardAmount >= 150000000000) {
      // if hbar amount is more than 100hbar
      _rewardAmount = 150000000000;
      await timerAction.calculateReward(_accountInfo, _rewardAmount);
      // broadcast notification
      let _rewardNotification = new Notification({
        isBroadcast: true,
        alertType: 'reward notification'
      });
      await _rewardNotification.save();

      for (let i = 0; i < _accountInfo.length; i++) {
        if (_accountInfo[i].level > 1) {
          await RewardInfo.findOneAndUpdate(
            { accountId: _accountInfo[i].accountId },
            { notificationId: _rewardNotification._id }
          );
          if (_accountInfo[i].socketId != '')
            io.to(_accountInfo[i].socketId).emit('getReward');
        }
      }
    }
  }
}, 1000);*/

// Add this
// Listen for when the client connects via socket.io-client
io.on("connection", async (socket) => {
  console.log("a user connected: ", socket.id);
  //  Init.onInit(io, socket);

  // Invite friend
  socket.on("inviteToFriend", async (fromId, toId, toPlayerId) => {
    let fromIdInfo = await Account.findOne({ accountId: fromId });

    if (fromIdInfo) {
      let playerInfo = {
        accountId: fromId,
        playerId: fromIdInfo.playerId,
        playerLvl: fromIdInfo.level,
        lvlProcess: (fromIdInfo.currentLevelScore / fromIdInfo.targetLevelScore) * 100,
        friendFlag: false,
        aliveFlag: true,
        avatarUrl: fromIdInfo.avatarUrl,
        degenlandNftCount: fromIdInfo.degenlandCount,
        tycoonNftCount: fromIdInfo.tycoonCount,
        mogulNftCount: fromIdInfo.mogulCount,
        investorNftCount: fromIdInfo.investorCount
      };

      let InviteInfo = new Notification({
        accountId: toId,
        playerId: toPlayerId,
        alertType: 'invite friend',
        playerInfo: playerInfo,
      });
      await InviteInfo.save();

      //      socket.broadcast.emit('inviteSuccess', InviteInfo, InviteInfo._id);
      let toIdInfo = await Account.findOne({ accountId: toId });
      io.to(toIdInfo.socketId).emit('inviteSuccess', InviteInfo, InviteInfo._id);
    }
  });

  //Accept invitation
  socket.on("setAccept", async (senderId, senderPlayerId, notificationInfo) => {
    const _senderAccountId = senderId;
    const _senderPlayerId = senderPlayerId;
    const _notificationInfo = notificationInfo;
    const _receiverAccountId = _notificationInfo.playerInfo.accountId;
    const _receiverPlayerId = _notificationInfo.playerInfo.playerId;

    let playerInfo = {
      accountId: _senderAccountId,
      playerId: _senderPlayerId
    };

    await Notification.findOneAndDelete({ _id: _notificationInfo._id });

    let InviteInfo = new Notification({
      accountId: _receiverAccountId,
      playerId: _receiverPlayerId,
      alertType: 'invite friend',
      playerInfo: playerInfo,
      state: 'accepted'
    });
    await InviteInfo.save();

    socket.emit("clearAcceptedNotification", _senderAccountId, InviteInfo._id);

    let fromIdInfo = await Account.findOne({ accountId: _receiverAccountId });
    io.to(fromIdInfo.socketId).emit("alertAccepted", _receiverAccountId, InviteInfo._id);
  });

  // Decline invitation
  socket.on("setDecline", async (senderId, senderPlayerId, notificationInfo) => {
    const _senderAccountId = senderId;
    const _senderPlayerId = senderPlayerId;
    const _notificationInfo = notificationInfo;
    const _receiverAccountId = _notificationInfo.playerInfo.accountId;
    const _receiverPlayerId = _notificationInfo.playerInfo.playerId;

    let playerInfo = {
      accountId: _senderAccountId,
      playerId: _senderPlayerId
    };

    await Notification.findOneAndDelete({ _id: _notificationInfo._id });

    let InviteInfo = new Notification({
      accountId: _receiverAccountId,
      playerId: _receiverPlayerId,
      alertType: 'invite friend',
      playerInfo: playerInfo,
      state: 'declined'
    });
    await InviteInfo.save();

    socket.emit("clearDeclinedNotification", _senderAccountId, InviteInfo._id);

    let fromIdInfo = await Account.findOne({ accountId: _receiverAccountId });
    io.to(fromIdInfo.socketId).emit("alertDeclined", _receiverAccountId, InviteInfo._id);
  });

  //Send private message
  socket.on("sendPrivateMsg", async (fromId, toId, toPlayerId, val) => {
    let fromIdInfo = await Account.findOne({ accountId: fromId });

    if (fromIdInfo) {
      let playerInfo = {
        accountId: fromId,
        playerId: fromIdInfo.playerId,
        playerLvl: fromIdInfo.level,
        lvlProcess: (fromIdInfo.currentLevelScore / fromIdInfo.targetLevelScore) * 100,
        friendFlag: false,
        aliveFlag: true,
        avatarUrl: fromIdInfo.avatarUrl,
        degenlandNftCount: fromIdInfo.degenlandCount,
        tycoonNftCount: fromIdInfo.tycoonCount,
        mogulNftCount: fromIdInfo.mogulCount,
        investorNftCount: fromIdInfo.investorCount
      };

      let _newNotification = new Notification({
        accountId: toId,
        playerId: toPlayerId,
        alertType: 'private message',
        playerInfo: playerInfo,
      });
      await _newNotification.save();

      let _newMessage = new PrivateMessage({
        senderAccountId: fromId,
        receiverAccountId: toId,
        chatContent: val
      })
      await _newMessage.save();

      let toIdInfo = await Account.findOne({ accountId: toId });
      io.to(toIdInfo.socketId).emit('receivePrivateMsg', _newNotification, val);
    }
  });

  //Send nft swap offer
  socket.on("sendOffer", async (provider, receiverAccountId, offerInfo) => {
    /** Save offer in db */
    let providerToken = {
      hbar: offerInfo.myHbar,
      pal: offerInfo.myPal
    };

    let providerNfts = [];

    if (offerInfo.myNftInfo.length > 0) {
      offerInfo.myNftInfo.map((item, index) => {
        if (item.tokenId != env.getDegenlandNftId && item.tokenId != env.getTycoonNftId && item.tokenId != env.getMogulNftId && item.tokenId != env.getInvestorNftId) {
          let nft = {
            tokenId: item.tokenId,
            serialNum: item.serialNum,
            fallback: item.fallback,
            nft_type: 'NormalNft',
            imgUrl: item.imgUrl,
            creator: item.creator,
            name: item.name,
            buildingCount: item.buildingCount,
            score: item.score,
            totalVisitor: item.totalVisitor
          };
          providerNfts.push(nft);
        }
        else
          providerNfts.push(item);
      });
    }

    let receiverToken = {
      hbar: offerInfo.friendHbar,
      pal: offerInfo.friendPal
    };

    let receiverNfts = [];

    offerInfo.friendNftInfo.map((item, index) => {
      if (item.tokenId != env.getDegenlandNftId && item.tokenId != env.getTycoonNftId && item.tokenId != env.getMogulNftId && item.tokenId != env.getInvestorNftId) {
        let nft = {
          tokenId: item.tokenId,
          serialNum: item.serialNum,
          fallback: item.fallback,
          nft_type: 'NormalNft',
          imgUrl: item.imgUrl,
          creator: item.creator,
          name: item.name,
          buildingCount: item.buildingCount,
          score: item.score,
          totalVisitor: item.totalVisitor
        };
        receiverNfts.push(nft);
      }
      else
        receiverNfts.push(item);
    });

    let providerInfo = {
      accountId: provider.accountId,
      playerId: provider.playerId,
      avatarUrl: provider.avatarUrl,
      connectState: provider.connectState,
      level: provider.level,
      currentLevelScore: provider.currentLevelScore,
      targetLevelScore: provider.targetLevelScore
    };

    // get receiver Info
    const receiverData = await Account.findOne({ accountId: receiverAccountId });

    let receiverInfo = {
      accountId: receiverData.accountId,
      playerId: receiverData.playerId,
      avatarUrl: receiverData.avatarUrl,
      connectState: receiverData.connectState,
      level: receiverData.level,
      currentLevelScore: receiverData.currentLevelScore,
      targetLevelScore: receiverData.targetLevelScore
    };

    let newOffer = new OfferList({
      providerInfo: providerInfo,
      providerToken: providerToken,
      providerNfts: providerNfts,
      receiverInfo: receiverInfo,
      receiverToken: receiverToken,
      receiverNfts: receiverNfts
    });
    await newOffer.save();

    /** Create notification */
    let playerInfo = {
      accountId: provider.accountId,
      playerId: provider.playerId
    };

    let newNotification = new Notification({
      accountId: receiverData.accountId,
      playerId: receiverData.playerId,
      alertType: 'nft swap offer',
      alertId: newOffer._id,
      playerInfo: playerInfo,
    });
    await newNotification.save();

    socket.emit('createdOffer', newOffer._id);
    io.to(receiverData.socketId).emit('successSendOffer', receiverData.accountId, newNotification._id);
  });

  /**
   * Accept offer
   */
  socket.on("setAcceptOffer", async (offerInfo) => {
    const receiverInfo = offerInfo.receiverInfo;
    const providerInfo = offerInfo.providerInfo;

    /** Create notification */
    let playerInfo = {
      accountId: receiverInfo.accountId,
      playerId: receiverInfo.playerId
    };

    let newNotification = new Notification({
      accountId: providerInfo.accountId,
      playerId: providerInfo.playerId,
      alertType: 'nft swap offer',
      alertId: offerInfo._id,
      playerInfo: playerInfo,
      state: "accepted"
    });
    await newNotification.save();

    socket.emit("successAcceptOffer", receiverInfo.accountId, newNotification._id);

    let fromIdInfo = await Account.findOne({ accountId: providerInfo.accountId });
    io.to(fromIdInfo.socketId).emit("alertOfferAccepted", providerInfo.accountId, newNotification._id);
  });

  //Offer Decline
  socket.on("setOfferDecline", async (offerInfo) => {
    const dbOfferData = await OfferList.findOne({ _id: offerInfo._id });
    if (dbOfferData) {
      const receiverInfo = dbOfferData.receiverInfo;
      const providerInfo = dbOfferData.providerInfo;
      const state = dbOfferData.state;

      /** Create notification */
      let playerInfo = {
        accountId: receiverInfo.accountId,
        playerId: receiverInfo.playerId
      };

      let newNotification = new Notification({
        accountId: providerInfo.accountId,
        playerId: providerInfo.playerId,
        alertType: 'nft swap offer',
        alertId: dbOfferData._id,
        playerInfo: playerInfo,
        state: "declined"
      });
      await newNotification.save();

      if (state == 'new')
        await OfferList.findOneAndDelete({ _id: dbOfferData._id });
      else if (state == 'approved') {
        await OfferList.findOneAndUpdate(
          { _id: dbOfferData._id },
          { state: 'declined', receiverClaimed: true }
        );
      }
      else {
        await OfferList.findOneAndUpdate(
          { _id: dbOfferData._id },
          { state: 'declined', claimableState: true }
        );
      }
      socket.emit("successDeclineOffer", receiverInfo.accountId, newNotification._id);

      let fromIdInfo = await Account.findOne({ accountId: providerInfo.accountId });
      io.to(fromIdInfo.socketId).emit("alertOfferDeclined", newNotification);
    }
  });

  /**
 * Approve
 */
  socket.on("setOfferApproved", async (offerInfo) => {
    const receiverInfo = offerInfo.receiverInfo;
    const providerInfo = offerInfo.providerInfo;

    /** Create notification */
    let playerInfo = {
      accountId: providerInfo.accountId,
      playerId: providerInfo.playerId
    };

    let newNotification = new Notification({
      accountId: receiverInfo.accountId,
      playerId: receiverInfo.playerId,
      alertType: "nft swap offer",
      alertId: offerInfo._id,
      playerInfo: playerInfo,
      state: "approved"
    });
    await newNotification.save();

    await OfferList.findOneAndUpdate(
      { _id: offerInfo._id },
      { state: 'approved', claimableState: true }
    );

    let fromIdInfo = await Account.findOne({ accountId: receiverInfo.accountId });
    io.to(fromIdInfo.socketId).emit("alertOfferApproved", receiverInfo.accountId, newNotification._id);
  });

  //--------------------------------------------------------
  // Phaser
  socket.on("map", async (accountId) => {
    const playerInfo = await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        frame: 10,
        address: "",
        targetPos: "",
        nftAddress: '',
        x: 0,
        y: 0,
        n: 0,
        m: 0,
        isdancing: false,
        connectState: false,
        loginState: true,
        socketId: socket.id,
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

    // notify the friends
    for (let i = 0; i < playerInfo.friendList.length; i++) {
      const _friendInfo = await Account.findOne({ accountId: playerInfo.friendList[i] });
      if (_friendInfo.socketId != '')
        io.to(_friendInfo.socketId).emit('friendLogin', playerInfo.playerId);
    }
  });

  // house construction mode
  socket.on("joinHouseConstruction", async (buildingId) => {
    let buildingList = await Furniture.find({ buildingId: buildingId });
    socket.emit("houseMapInit", buildingList);
  });

  // house view mode
  socket.on("joinHouseInside", async (address, targetPos, x, y, n, m, accountId, buildingId) => {
    let furnitureList = await Furniture.find({ buildingId: buildingId });

    let player = await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        frame: 10,
        address: address,
        targetPos: targetPos,
        x: 0,
        y: 0,
        n: 0,
        m: 0,
        connectState: true,
        loginState: true,
        socketId: socket.id,
        buildingInsideInfo: {
          buildingId: buildingId,
          x: x,
          y: y,
          n: n,
          m: m,
          isIn: true
        }
      },
      { new: true }
    );

    // Get players in the same address
    const players = await Account.find({ address: address, targetPos: targetPos, 'buildingInsideInfo.buildingId': buildingId });

    let _preHashStr = buildingId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.join(buildingId);
    socket.emit("houseMapInit", furnitureList);
    socket.emit("currentPlayersInsideHouse", players, _hashStr);
    socket.broadcast.to(buildingId).emit("newPlayerInsideHouse", player, _hashStr);
  });

  socket.on("joinBuilding", async (address, targetPos, x, y, n, m, accountId, buildingId) => {
    let player = await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        frame: 10,
        address: address,
        targetPos: targetPos,
        x: 0,
        y: 0,
        n: 0,
        m: 0,
        connectState: true,
        loginState: true,
        socketId: socket.id,
        buildingInsideInfo: {
          buildingId: buildingId,
          x: x,
          y: y,
          n: n,
          m: m,
          isIn: true
        }
      },
      { new: true }
    );

    // add user count
    // let buildingInfo = await Placement.findOne({ _id: buildingId });
    // if (!buildingInfo) {
    //   await Placement.findOneAndUpdate(
    //     { _id: buildingId },
    //     { userCount: buildingInfo.userCount + 1 }
    //   );
    // }

    // Get players in the same address
    const players = await Account.find({ address: address, targetPos: targetPos, 'buildingInsideInfo.buildingId': buildingId });

    let _preHashStr = buildingId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.join(buildingId);
    socket.emit("currentPlayersInside", players, _hashStr);
    socket.broadcast.to(buildingId).emit("newPlayerInside", player, _hashStr);
  });

  socket.on("join", async (mode, address, targetPos, x, y, n, m, accountId) => {
    // view mode
    if (mode == 'view') {
      let placeInfo = await Place.findOne({ address: address, pos: targetPos });
      let player = await Account.findOneAndUpdate(
        { accountId: accountId },
        {
          frame: 10,
          address: address,
          targetPos: targetPos,
          nftAddress: placeInfo.name,
          x: x,
          y: y,
          n: n,
          m: m,
          isdancing: false,
          connectState: true,
          loginState: true,
          socketId: socket.id
        },
        { new: true }
      );

      // Calculate score
      let place = await Place.findOne({ address: address, pos: targetPos });
      await Place.findOneAndUpdate(
        { address: place.address, pos: place.pos },
        {
          score: place.score + 5,
          totalVisitor: ++place.totalVisitor,
          currentVisitor: ++place.currentVisitor
        }
      );

      let playerInfo = await Account.findOne({ accountId: accountId });
      await Account.findOneAndUpdate(
        { accountId: accountId },
        {
          totalLevelScore: playerInfo.totalLevelScore + 2
        }
      )

      // Get players in the same address
      let players = await Account.find({ address: address, 'buildingInsideInfo.isIn': false });

      let buildingList = await Placement.find({ address: address, built: true });
      socket.join(address);

      socket.emit("mapInit", buildingList, place._id);
      socket.emit("currentPlayers", players);
      socket.broadcast.to(address).emit("newPlayer", player);
    }
    //construction
    else if (mode == 'construction') {
      // construction mode
      let buildingList = await Placement.find({ address: address, built: true });
      socket.join(address);
      /*
            socket.join(address);
            socket.broadcast.to(address).emit("updateMap", buildingList);
      */
      socket.emit("mapInit", buildingList);
    }
  });

  // Get building Info
  socket.on('getBuildingInfo', async () => {
    let buildingInfo = await Building.find({});
    socket.emit("setBuildingInfo", buildingInfo);
  });

  socket.on("chating", async (chatContent, accountId, playerId, address) => {
    const playerInfo = await Account.findOne({ accountId: accountId });
    socket.broadcast.to(address).emit("chating", chatContent, playerInfo);
  });

  socket.on("emojing", async (emoji, playerId, address) => {
    socket.broadcast.to(address).emit("emojing", emoji, playerId);
  });

  socket.on("buildingEntered", async (accountId, address) => {
    const player = await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        x: 0,
        y: 0,
        n: 0,
        m: 0
      },
      { new: true }
    );
    socket.broadcast.to(address).emit("entered", player);
  });

  socket.on("playerMovement", async (target, accountId, address) => {
    let player = await Account.findOne({ accountId: accountId });

    var tilem = target.tilem;
    var tilen = target.tilen;
    // emit a message to all players about the player that moved
    socket.broadcast.to(address).emit("playerMoved", player, tilem, tilen);
  });

  socket.on("playerPosition", async (posInfo, n, m, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        x: posInfo.x,
        y: posInfo.y,
        n: n,
        m: m
      }
    );
  });

  // building inside
  socket.on("playerMovementInside", async (target, accountId, address) => {
    let player = await Account.findOne({ accountId: accountId });

    var tilem = target.tilem;
    var tilen = target.tilen;

    let _preHashStr = address + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    // emit a message to all players about the player that moved
    socket.broadcast.to(address).emit("playerMovedInside", player, tilem, tilen, _preHashStr);
  });

  // dancing
  socket.on("dancing", async (address, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      { isdancing: true }
    );

    let _preHashStr = accountId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.broadcast.to(address).emit("playerDancing", accountId, _hashStr);
  });

  // stop dancing
  socket.on("stopDancing", async (address, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      { isdancing: false }
    );

    let _preHashStr = accountId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.broadcast.to(address).emit("stopPlayerDancing", accountId, _hashStr);
  });

  // delete player that teleport in view mode
  socket.on('teleportInViewMode', async (_address, _accountId) => {
    let _oldPlayerInfo = await Account.findOne({ accountId: _accountId });

    let place = await Place.findOne({ address: _oldPlayerInfo.address, pos: _oldPlayerInfo.targetPos });
    await Place.findOneAndUpdate(
      { address: place.address, pos: place.pos },
      { currentVisitor: place.currentVisitor - 1 }
    );

    socket.broadcast.to(_address).emit("deletePlayerInViewMode", _accountId);
  });

  // delete player that teleport in building inside mode
  socket.on('teleportInBuildingInsideMode', async (_address, _accountId) => {
    let _oldPlayerInfo = await Account.findOne({ accountId: _accountId });

    let place = await Place.findOne({ address: _oldPlayerInfo.address, pos: _oldPlayerInfo.targetPos });
    await Place.findOneAndUpdate(
      { address: place.address, pos: place.pos },
      { currentVisitor: place.currentVisitor - 1 }
    );

    socket.broadcast.to(_address).emit("deletePlayerInBuildingInsideMode", _accountId);
  });

  // delete player that visit other place in view mode
  socket.on('visitPlaceInViewMode', async (_address, _accountId) => {
    let _oldPlayerInfo = await Account.findOne({ accountId: _accountId });

    let place = await Place.findOne({ address: _oldPlayerInfo.address, pos: _oldPlayerInfo.targetPos });
    await Place.findOneAndUpdate(
      { address: place.address, pos: place.pos },
      { currentVisitor: place.currentVisitor - 1 }
    );

    socket.broadcast.to(_address).emit("deletePlayerInViewMode", _accountId);
  });

  // delete player that visit other place in building inside mode
  socket.on('visitPlaceInBuildingInsideMode', async (_address, _accountId) => {
    let _oldPlayerInfo = await Account.findOne({ accountId: _accountId });

    let place = await Place.findOne({ address: _oldPlayerInfo.address, pos: _oldPlayerInfo.targetPos });
    await Place.findOneAndUpdate(
      { address: place.address, pos: place.pos },
      { currentVisitor: place.currentVisitor - 1 }
    );

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
    socket.broadcast.to(_address).emit("deletePlayerInBuildingInsideMode", _accountId);
  });

  // dancing
  socket.on("buildingInfoDancing", async (address, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      { isdancing: true }
    );

    let _preHashStr = accountId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.broadcast.to(address).emit("buildingInfoPlayerDancing", accountId, _hashStr);
  });

  // stop dancing
  socket.on("buildingInfoStopDancing", async (address, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      { isdancing: false }
    );

    let _preHashStr = accountId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.broadcast.to(address).emit("buildingInfoStopPlayerDancing", accountId, _hashStr);
  });

  /**
   * in house
   */
  // dancing
  socket.on("houseInsideDancing", async (address, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      { isdancing: true }
    );

    let _preHashStr = accountId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.broadcast.to(address).emit("houseInsidePlayerDancing", accountId, _hashStr);
  });

  // stop dancing
  socket.on("houseInsideStopDancing", async (address, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      { isdancing: false }
    );

    let _preHashStr = accountId + Date.now();
    const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');

    socket.broadcast.to(address).emit("houseInsideStopPlayerDancing", accountId, _hashStr);
  });

  socket.on("playerPositionInside", async (buildingId, posInfo, n, m, accountId) => {
    await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        buildingInsideInfo: {
          buildingId: buildingId,
          x: posInfo.x,
          y: posInfo.y,
          n: n,
          m: m,
          isIn: true
        }
      }
    );
  });

  socket.on("setRoad", async (building) => {
    // Get building info
    let buildingInfo = await Building.findOne({ index: building.type });

    let newBuilding = new Placement({
      address: building.address,
      pos: building.pos,
      sno: building.sno,
      type: building.type,
      buildingType: buildingInfo.type,
      built: building.built,
      ads: building.ads,
      owner: building.owner
    });
    // Save user to DB
    await newBuilding.save();

    // Increase the score of the place
    let place = await Place.findOne({ address: building.address, pos: building.pos });
    await Place.findOneAndUpdate(
      { address: place.address, pos: place.pos },
      {
        buildingCount: place.buildingCount + 1,
        score: place.score + buildingInfo.score
      }
    );

    socket.emit("updateInfo");
    //    socket.broadcast.to(building.address).emit("changeMap", newBuilding);
  });

  socket.on("setBuilding", async (building) => {
    // Get building info
    let buildingInfo = await Building.findOne({ index: building.type });

    let newBuilding = new Placement({
      address: building.address,
      pos: building.pos,
      sno: building.sno,
      type: building.type,
      buildingType: buildingInfo.type,
      name: buildingInfo.name,
      built: building.built,
      remaintime: buildingInfo.buildtime,
      ads: building.ads,
      linkurl: '',
      owner: building.owner,
      sizex: buildingInfo.sizex,
      sizey: buildingInfo.sizey
    });
    // Save user to DB
    await newBuilding.save();
    if (buildingInfo.name == 'Night Club')
      socket.emit("setTicket", newBuilding._id);
    else if (buildingInfo.name == 'Billboard')
      socket.emit("setAdvertisement", newBuilding._id);

    //    socket.broadcast.to(building.address).emit("changeMap", newBuilding);
    if (buildingInfo.buildtime != 0) {
      let count = buildingInfo.buildtime + 1;
      let interval = setInterval(async () => {
        count--;

        let build = await Placement.findOne({ address: building.address, sno: building.sno, pos: building.pos });
        if (build) {
          build = await Placement.findOneAndUpdate(
            { address: building.address, sno: building.sno, pos: building.pos },
            { remaintime: count - 1 },
            { new: true }
          );
          socket.emit("buildingTime", build);
        }

        /**
         * building completion
         */
        if (count == 1) {
          let build = await Placement.findOne({ address: building.address, sno: building.sno, pos: building.pos });
          if (build) {
            build = await Placement.findOneAndUpdate(
              { address: building.address, sno: building.sno, pos: building.pos },
              { built: true },
              { new: true }
            );
          }

          if (buildingInfo.name == 'free building' || buildingInfo.name == 'Night Club') {
            // temp update place score
            let place = await Place.findOne({ address: building.address, pos: building.pos });
            await Place.findOneAndUpdate(
              { address: place.address, pos: place.pos },
              {
                buildingCount: place.buildingCount + 1,
                score: place.score + buildingInfo.score,
              }
            );
          }
          else {
            // Increase the score of the place
            let place = await Place.findOne({ address: building.address, pos: building.pos });
            await Place.findOneAndUpdate(
              { address: place.address, pos: place.pos },
              {
                buildingCount: place.buildingCount + 1
              }
            );
          }

          //        io.emit("buildingCompletion", build);
          //        io.to(building.address).emit("buildingCompletion", build);
          socket.emit("buildingCompletion", build);
          socket.emit("updateInfo");
          clearInterval(interval);
        }
      }, 1000);
    }
    else {
      // Increase the score of the place
      let place = await Place.findOne({ address: building.address, pos: building.pos });
      await Place.findOneAndUpdate(
        { address: place.address, pos: place.pos },
        {
          buildingCount: place.buildingCount + 1
        }
      );
      let build = await Placement.findOne({ address: building.address, sno: building.sno, pos: building.pos });
      socket.emit("buildingCompletion", build);
      socket.emit("updateInfo");
    }
  });

  // house construction
  socket.on("setHouse", async (building) => {
    // Get building info
    let buildingInfo = await Building.findOne({ index: building.type });

    let newFurniture = new Furniture({
      buildingId: building.buildingId,
      address: building.address,
      pos: building.pos,
      sno: building.sno,
      type: building.type,
      name: buildingInfo.name,
      built: building.built
    });
    // Save user to DB
    await newFurniture.save();

    // Increase the score of the place
    let place = await Place.findOne({ address: building.address, pos: building.pos });
    await Place.findOneAndUpdate(
      { address: place.address, pos: place.pos },
      {
        score: place.score + buildingInfo.score
      }
    );

    socket.emit("updateInfo");
  });

  /**
   * In Construction
   */
  socket.on("inConstruction", async (building) => {
    let count = building.remaintime + 1;
    let interval = setInterval(async () => {
      count--;

      let build = await Placement.findOne({ address: building.address, sno: building.sno, type: building.type });
      if (build) {
        build = await Placement.findOneAndUpdate(
          { address: building.address, sno: building.sno, type: building.type },
          { remaintime: count - 1 },
          { new: true }
        );
        socket.emit("in-buildingTime", build);
      }

      /**
       * building completion
       */
      if (count == 1) {
        clearInterval(interval);
        //        io.emit("in-buildingCompletion", building);
        socket.emit("updateInfo");
        io.to(building.address).emit("in-buildingCompletion", building);
        let build = await Placement.findOne({ address: building.address, sno: building.sno, type: building.type });
        if (build) {
          build = await Placement.findOneAndUpdate(
            { address: building.address, sno: building.sno, type: building.type },
            { built: true },
            { new: true }
          );
        }
      }
    }, 1000);
  });

  socket.on("building_destroy", async (sno, address) => {
    const building = await Placement.findOne({ sno: sno, address: address });
    // Get building info
    let buildingInfo = await Building.findOne({ index: building.type });

    if (buildingInfo.type == 'building') {
      if (building.name == 'free building' || building.name == 'Night Club') {
        // Decrease the building count and score
        let place = await Place.findOne({ address: building.address, pos: building.pos });
        await Place.findOneAndUpdate(
          { address: place.address, pos: place.pos },
          {
            buildingCount: place.buildingCount - 1,
            score: place.score - buildingInfo.score,
          }
        );
      }
      else if (building.name == 'Small house' || building.name == 'Medium house' || building.name == 'Mansion') {
        // Decrease the building count
        let place = await Place.findOne({ address: building.address, pos: building.pos });
        await Place.findOneAndUpdate(
          { address: place.address, pos: place.pos },
          {
            buildingCount: place.buildingCount - 1
          }
        );
        // Destroy all furniture
        await Furniture.deleteMany({ buildingId: building._id });
      }
      else {
        // Decrease the building count
        let place = await Place.findOne({ address: building.address, pos: building.pos });
        await Place.findOneAndUpdate(
          { address: place.address, pos: place.pos },
          {
            buildingCount: place.buildingCount - 1
          }
        );
      }
    }
    else {
      // Decrease the building count and score
      let place = await Place.findOne({ address: building.address, pos: building.pos });
      await Place.findOneAndUpdate(
        { address: place.address, pos: place.pos },
        {
          buildingCount: place.buildingCount - 1,
          score: place.score - buildingInfo.score,
        }
      );
    }
    await Placement.findOneAndRemove({ sno: sno, address: address });

    socket.emit("updateInfo");
    //    socket.broadcast.to(address).emit("building_destroy", sno);
  });

  socket.on("furniture_destroy", async (houseId, sno) => {
    await Furniture.findOneAndRemove({ buildingId: houseId, sno: sno });
  });

  socket.on("setLink", async (sno, address, url) => {
    await Placement.findOneAndUpdate(
      { sno: sno, address: address },
      { linkurl: url },
      { new: true }
    );
  });

  socket.on("disconnect", async () => {
    if (socket.id != null) {
      let _oldPlayerInfo = await Account.findOne({ socketId: socket.id });
      if (_oldPlayerInfo != null) {
        console.log("user disconnected: ", _oldPlayerInfo.accountId);

        let place = await Place.findOne({ address: _oldPlayerInfo.address, pos: _oldPlayerInfo.targetPos });
        if (place) {
          await Place.findOneAndUpdate(
            { address: place.address, pos: place.pos },
            { currentVisitor: place.currentVisitor - 1 }
          );
        }

        // notify the friends
        for (let i = 0; i < _oldPlayerInfo.friendList.length; i++) {
          const _friendInfo = await Account.findOne({ accountId: _oldPlayerInfo.friendList[i] });
          if (_friendInfo.socketId != '')
            io.to(_friendInfo.socketId).emit('friendLogout', _oldPlayerInfo.playerId);
        }

        await Account.findOneAndUpdate(
          { socketId: socket.id },
          {
            frame: 10,
            address: '',
            targetPos: '',
            nftAddress: '',
            x: 0,
            y: 0,
            n: 0,
            m: 0,
            socketId: '',
            isdancing: false,
            connectState: false,
            loginState: false,
            hasNightclubTicket: false,
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

        if (_oldPlayerInfo.buildingInsideInfo.buildingId != '') {
          socket.broadcast.to(_oldPlayerInfo.buildingInsideInfo.buildingId).emit("disconnected", _oldPlayerInfo.accountId);
        }
        else {
          socket.broadcast.to(_oldPlayerInfo.address).emit("disconnected", _oldPlayerInfo.accountId);
        }
      }
    }
    socket.disconnect();
  });
});

server.listen(3306, () => 'Server is running on port 3306');
// server.listen(httpsPort, () => {
//   console.log(`[degenland.tech] servier is running at port ${httpsPort} as https.`);
// });