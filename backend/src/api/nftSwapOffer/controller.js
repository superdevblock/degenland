const Account = require('../../models/Account');
const OfferList = require('../../models/OfferList');
const SwapCollection = require('../../models/swap/SwapCollection');

exports.getOffer = async (req, res) => {
  try {
    if (!req.query.providerAccountId || !req.query.offerId) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let providerAccountId = req.query.providerAccountId;
      let offerId = req.query.offerId;

      /** Get provider info */
      let providerInfo = await Account.findOne({ accountId: providerAccountId });

      /** Get offer info */
      let offer = await OfferList.findOne({ _id: offerId });

      const resData = {
        providerInfo: providerInfo,
        offerInfo: offer
      }
      //send response
      res.send({
        status: true,
        message: 'Success',
        data: resData
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getSwapId = async (req, res) => {
  try {
    if (!req.query.offerId) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let offerId = req.query.offerId;

      /** Get offer info */
      let offer = await OfferList.findOne({ _id: offerId });

      const resData = {
        providerSwapId: offer.providerSwapId,
        receiverSwapId: offer.receiverSwapId
      }
      //send response
      res.send({
        status: true,
        message: 'Success',
        data: resData
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getClaimState = async (req, res) => {
  try {
    if (!req.query.offerId || !req.query.accountId) {
      return res.send({ result: false, error: 'failed!' });
    } else {
      const _offerId = req.query.offerId;
      const _accountId = req.query.accountId;

      /** Get offer info */
      let offerData = await OfferList.findOne({ _id: _offerId });
      if (offerData.providerInfo.accountId == _accountId) {
        if (offerData.providerClaimApproved == true && Date.now() - offerData.providerClaimTime < 1800000)
          return res.send({ result: true, data: true });
        else
          return res.send({ result: true, data: false });
      }
      else if (offerData.receiverInfo.accountId == _accountId) {
        if (offerData.receiverClaimApproved == true && Date.now() - offerData.receiverClaimTime < 1800000)
          return res.send({ result: true, data: true });
        else
          return res.send({ result: true, data: false });
      }
      return res.send({ result: false, error: 'Error detected in server progress!' });
    }
  } catch (err) {
    return res.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.getOfferState = async (req, res) => {
  try {
    if (!req.query.offerId) {
      return res.send({ result: false, error: 'failed!' });
    } else {
      const _offerId = req.query.offerId;

      /** Get offer info */
      let offerData = await OfferList.findOne({ _id: _offerId });

      if (!offerData)
        return res.send({ result: false, error: 'This offer already has canceled!' });
      return res.send({ result: true, data: offerData.state });
    }
  } catch (err) {
    return res.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.setClaimState = async (req, res) => {
  try {
    if (!req.body.offerId || !req.body.accountId) {
      return res.send({ result: false, error: 'failed!' });
    } else {
      const _offerId = req.body.offerId;
      const _accountId = req.body.accountId;
      const _state = req.body.state;

      /** Get offer info */
      let offerData = await OfferList.findOne({ _id: _offerId });
      if (offerData.providerInfo.accountId == _accountId) {
        await OfferList.findOneAndUpdate(
          { _id: _offerId },
          {
            providerClaimApproved: _state,
            providerClaimTime: Date.now()
          }
        );
      }
      else if (offerData.receiverInfo.accountId == _accountId) {
        await OfferList.findOneAndUpdate(
          { _id: _offerId },
          {
            receiverClaimApproved: _state,
            receiverClaimTime: Date.now()
          }
        );
      }
      return res.send({ result: true, msg: 'success!' });
    }
  } catch (err) {
    return res.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.getOfferList = async (req, res) => {
  try {
    if (!req.query.accountId) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let accountId = req.query.accountId;

      /** Get offer info */
      // let claimableOfferList = await OfferList.find(
      //   {
      //     $or: [{ 'providerInfo.accountId': accountId }, { 'receiverInfo.accountId': accountId }],
      //     $or: [{ providerClaimed: false }, { receiverClaimed: false }],
      //     state: 'accepted'
      //   }
      // ).sort({date: -1});
      let providerOfClaimableOfferList = await OfferList.find(
        {
          'providerInfo.accountId': accountId,
          providerClaimed: false,
          $or: [{ state: 'declined' }, { state: 'accepted' }]
        }
      ).sort({date: -1});

      let receiverOfClaimableOfferList = await OfferList.find(
        {
          'receiverInfo.accountId': accountId,
          receiverClaimed: false,
          $or: [{ state: 'declined' }, { state: 'accepted' }]
        }
      ).sort({date: -1});

      // let declinedOfferList = await OfferList.find(
      //   {
      //     'providerInfo.accountId': accountId,
      //     $or: [{ providerClaimed: false }, { receiverClaimed: false }],
      //     state: 'declined'
      //   }
      // ).sort({date: -1});

      let claimableOfferList = providerOfClaimableOfferList.concat(receiverOfClaimableOfferList);
      let myOffer = await OfferList.find({ 'providerInfo.accountId': accountId, $or: [{ state: 'new' }, { state: 'approved' }] }).sort({date: -1});
      let receivedOffer = await OfferList.find({ 'receiverInfo.accountId': accountId, $or: [{ state: 'new' }, { state: 'approved' }] }).sort({date: -1});

      const resData = {
        claimableOfferList: claimableOfferList,
        myOffer: myOffer,
        receivedOffer: receivedOffer
      }
      //send response
      res.send({
        status: true,
        message: 'Success',
        data: resData
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getToken = async (req, res) => {
  console.log("getToken log ", req.query);
  try {
    if (!req.query.swapId) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let _swapId = atob(req.query.swapId);

      const swapCollection = await SwapCollection.findOne({ swapId: _swapId });
      console.log(swapCollection);

      const resData = {
        hbar: swapCollection.offerHbar,
        pal: swapCollection.offerPal
      }
      console.log(resData);
      //send response
      res.send({
        status: true,
        message: 'Success',
        data: resData
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.editOffer = async (req, res) => {
  try {
    if (!req.body.offerId || !req.body.newOfferInfo) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let offerId = req.body.offerId;
      let newOfferInfo = req.body.newOfferInfo;
      console.log("newOfferInfo log ", newOfferInfo);

      let newOffer = await OfferList.findOneAndUpdate(
        { _id: offerId },
        { providerToken: newOfferInfo.providerToken, providerNfts: newOfferInfo.providerNfts, receiverToken: newOfferInfo.receiverToken, receiverNfts: newOfferInfo.receiverNfts },
        { new: true }
      );
      console.log(newOffer);

      //send response
      res.send({
        status: true,
        message: 'Success'
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.updateOffer = async (req, res) => {
  try {
    if (!req.body.offerId || !req.body.state) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let offerId = req.body.offerId;
      let state = req.body.state;
      let claimableState = req.body.claimableState;

      await OfferList.findOneAndUpdate(
        { _id: offerId },
        { state: state, claimableState: claimableState }
      );

      //send response
      res.send({
        status: true,
        message: 'Success'
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}