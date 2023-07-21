const Place = require('../../models/Place');
const Account = require('../../models/Account');
const env = require("../../config/env");

exports.decreaseVisitor = async (req, res) => {
  try {
    if (!req.body.address || !req.body.pos) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let place = await Place.findOne({ address: req.body.address, pos: req.body.pos });
      console.log(place.currentVisitor);

      place = await Place.findOneAndUpdate(
        { address: req.body.address, pos: req.body.pos },
        {
          currentVisitor: --place.currentVisitor
        },
        { new: true }
      );

      //send response
      res.send({
        status: true,
        message: 'Success',
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getcurrentVisitor = async (req, res) => {
  try {
    const address = req.query.address;
    const pos = req.query.pos;

    place = await Place.findOne({ address: address, pos: pos });

    //send response
    res.send({
      status: true,
      message: 'Success',
      data: place.currentVisitor
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getFamousPlace = async (req, res) => {
  try {
    place = await Place.find({token_id: env.getDegenlandNftId, address: { $ne: '' }}).sort({ currentVisitor: -1 }).sort({ score: -1 }).limit(5);

    if (place.length == 0)
      return res.send({ result: false, msg: 'No place data!' });

    return res.send({ result: true, data: place });
  } catch (err) {
    return res.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.getPlaceInfo = async (req, res) => {
  try {
    const nftdata = JSON.parse(req.query.nftdata);

    place = await Place.findOne({ token_id: nftdata.token_id, serialNumber: nftdata.serial_number });

    //send response
    res.send({
      status: true,
      message: 'Success',
      data: place
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

/** Get places info from nfts */
exports.getPlacesInfoFromNft = async (req, res) => {
  try {
    const nftInfo = JSON.parse(req.query.nftInfo);
    let placeInfo = [];
    await Promise.all(nftInfo.map(async (item, index) => {
      let place = await Place.findOne({ token_id: item.token_id, serialNumber: item.serial_number });

      if (place) {
        let newInfo = {
          token_id: place.token_id,
          serial_number: place.serialNumber,
          buildingCount: place.buildingCount,
          totalVisitor: place.totalVisitor,
          currentVisitor: place.currentVisitor,
          score: place.score
        };
        placeInfo.push(newInfo);
      }
      else {
        let newInfo = {
          token_id: "",
          serial_number: 0,
          buildingCount: 0,
          totalVisitor: 0,
          currentVisitor: 0,
          score: 0
        };
        placeInfo.push(newInfo);
      }
    }));

    //send response
    res.send({
      status: true,
      message: 'Success',
      data: placeInfo
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

/** Get place info by name */
exports.getPlaceInfoByName = async (req, res) => {
  try {
    const _placeName = req.query.name;
    let placeInfo = await Place.findOne({ name: _placeName });
    if (!placeInfo)
      return res.send({ status: false, message: 'Invalid place!' });
    return res.send({ status: true, data: placeInfo });
  } catch (err) {
    return res.send({ status: false, error: 'Error detected in server progress!' });
  }
}

exports.updatePlaceInfo = async (req, res) => {
  try {
    const address = req.query.address;
    const targetPos = req.query.targetPos;

    place = await Place.findOne({ address: address, pos: targetPos });

    //send response
    res.send({
      status: true,
      message: 'Success',
      data: place
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.setPlaceInfo = async (req, res) => {
  try {
    if (!req.body.placeData) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      const _placeData = req.body.placeData;

      for (let i = 0; i < _placeData.length; i++) {
        let _address = _placeData[i].address;
        let _pos = _placeData[i].pos;
        let _nftInfo = _placeData[i].nftInfo;

        let placeOwner = await Account.findOne({ accountId: _nftInfo.owner });

        let ownerInfo = {
          playerId: placeOwner.playerId,
          avatarUrl: placeOwner.avatarUrl,
          connectState: placeOwner.connectState,
          level: placeOwner.level,
          currentLevelScore: placeOwner.currentLevelScore,
          targetLevelScore: placeOwner.targetLevelScore,
          degenlandNftCount: placeOwner.degenlandCount,
          tycoonNftCount: placeOwner.tycoonCount,
          mogulNftCount: placeOwner.mogulCount,
          investorNftCount: placeOwner.investorCount
        }

        await Place.findOneAndUpdate(
          { token_id: _nftInfo.token_id, serialNumber: _nftInfo.serial_number },
          {
            address: _address,
            pos: _pos,
            ownerInfo: ownerInfo
          }
        );
      }
      return res_.send({ status: true, message: 'Success' });
    }
  } catch (err) {
    return res.send({ result: false, error: 'Error detected in server progress!' });
  }
}