const { createHash } = require('crypto');

const Placement = require('../../models/Placement');
const Building = require('../../models/Building');
const Place = require('../../models/Place');

exports.getId = async (req, res) => {
  try {
    if (!req.query.address || !req.query.pos) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      const _address = req.query.address;
      const _pos = req.query.pos;
      const _index = req.query.index;
      const _sno = req.query.sno;

      const _placementInfo = await Placement.findOne({ address: _address, pos: _pos, sno: _sno });
      const _buildingInfo = await Building.findOne({ index: _index });
      const _placeInfo = await Place.findOne({ address: _address, pos: _pos });
      //send response
      res.send({
        status: true,
        message: 'Success',
        buildingId: _placementInfo._id,
        buildingInfo: _buildingInfo,
        ownerInfo: _placeInfo.ownerInfo
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getUrl = async (req, res) => {
  try {
    const _address = req.query.address;
    const _pos = req.query.pos;
    const _sno = req.query.sno;

    let building = await Placement.findOne({ address: _address, pos: _pos, sno: _sno });

    //send response
    res.send({
      status: true,
      message: 'Success',
      data: building.linkurl
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.setLinkUrl = async (req, res) => {
  console.log("setLinkUrl");
  try {
    if (!req.body.address || !req.body.pos) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let building = await Placement.findOne({ address: req.body.address, pos: req.body.pos });

      //send response
      res.send({
        status: true,
        message: 'Success',
        data: building.linkurl
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getTicket = async (req_, res_) => {
  try {
    const _address = req_.query.address;
    const _pos = req_.query.pos;

    // get NightClub ticket info
    const _placementData = await Placement.findOne({ address: _address, pos: _pos, buildingType: 'building', name: 'Night Club' });
    if (!_placementData)
      return res_.send({ result: true, data: null });

    const resData = {
      buildingId: _placementData._id,
      ticketId: _placementData.ticketId,
      imgUrl: _placementData.imgUrl
    };
    return res_.send({ result: true, data: resData });
  } catch (error) {
    return res_.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.setTicket = async (req_, res_) => {
  try {
    const _buildingId = req_.body.buildingId;
    const _ticketId = req_.body.ticketId;
    const _imgUrl = req_.body.imgUrl;

    await Placement.findOneAndUpdate(
      { _id: _buildingId },
      {
        ticketId: _ticketId,
        imgUrl: _imgUrl
      }
    );
    return res_.send({ result: true, data: 'success' });
  } catch (error) {
    return res_.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.uploadAdvertisement = async (req_, res_) => {
  try {
    if (!req_.files) {
      return res_.send({ result: false, error: 'failed' });
    } else {
      let u_advertisement = req_.files.advertisement;
      let _advertisementId = req_.body.advertisementId;
      let _linkUrl = req_.body.linkUrl;

      let u_nameList = u_advertisement.name.split(".");
      let u_ext = u_nameList[u_nameList.length - 1];
      let u_preHashStr = u_advertisement.name + Date.now();
      const u_hashStr = createHash('sha1').update(u_preHashStr).digest('hex');
      const u_newName = u_hashStr + "." + u_ext;
      //Use the mv() method to place the file in the upload directory (i.e. "uploads")
      await u_advertisement.mv(`./uploads/advertisements/` + u_newName);
      const _billboardInfo = await Placement.findOneAndUpdate(
        { _id: _advertisementId },
        {
          ads: '/advertisements/' + u_newName,
          mimetype: u_advertisement.mimetype,
          linkurl: _linkUrl
        },
        { new: true }
      );
      return res_.send({
        result: true,
        data: {
          name: '/advertisements/' + u_newName,
          mimetype: u_advertisement.mimetype,
          size: u_advertisement.size,
          billboardInfo: _billboardInfo
        }
      });
    }
  } catch (error) {
    return res_.send({ result: false, error: 'Error detected in server progress!' });
  }
}
