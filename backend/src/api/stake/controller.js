const { receiveAllowanceNftsAndToken, sendHbar, sendNft, associateCheck, setAssociate, getAllowance, claimTokenAndNfts, receiveAllowanceHbar, receiveAllowancePAL, palTokenTransfer } = require('../chainAction');

const { createHash } = require('crypto');

const OfferList = require('../../models/OfferList');
const Notification = require('../../models/Notification');
const SwapNftList = require('../../models/swap/SwapNftList');
const SwapCollection = require('../../models/swap/SwapCollection');
const SwapData = require('../../models/swap/SwapData');
const NftList = require('../../models/NftList');
const PalTokenSaleHistory = require('../../models/PalTokenSaleHistory');
const BuyBuildingHistory = require('../../models/BuyBuildingHistory');
const BuyBuilding = require('../../models/BuyBuilding');
const Building = require('../../models/Building');
const Place = require('../../models/Place');
const Account = require('../../models/Account');

// staking
exports.stakeNewNfts = async (req_, res_) => {
    console.log("stakeNewNfts body log - 1 : ", req_.body);
    try {
        const _offerId = atob(req_.body.offerId);
        const _type = atob(req_.body.type);
        const _accountId = atob(req_.body.accountId);
        const _nftInfo = JSON.parse(atob(req_.body.nftInfo));
        const _hbarAmount = parseInt(atob(req_.body.hbarAmount), 10);
        const _palAmount = parseInt(atob(req_.body.palAmount), 10);
        const _fee = parseInt(atob(req_.body.fee), 10);

        console.log("stakeNewNfts log - 1 : ", _offerId, _type, _accountId, _nftInfo, _hbarAmount, _palAmount, _fee);

        let _preHashStr = _accountId + Date.now();

        if (!_accountId || !_nftInfo)
            return res_.send({ result: false, error: "Invalid post data!" });

        // const allowanceResult = await getAllowance(_accountId, _hbarAmount + _fee);
        // console.log("allowanceResult log ", allowanceResult);

        // if (!allowanceResult)
        //     return res_.send({ result: false, error: "Something wrong with - allowance" });

        // check associate
        for (let i = 0; i < _nftInfo.length; i++) {
            _preHashStr += _nftInfo[i].tokenId + _nftInfo[i].serialNum;
            const checkAssociate = await associateCheck(_nftInfo[i].tokenId);
            console.log('checkAssociate log: ', checkAssociate);
            if (!checkAssociate) {
                const associateStatus = await setAssociate(_nftInfo[i].tokenId);
                if (!associateStatus)
                    return res_.send({ result: false, error: "Something wrong with - associate" });
            }
        }

        const receiveResult = await receiveAllowanceNftsAndToken(_accountId, _nftInfo, _hbarAmount + _fee, _palAmount);

        console.log('receiveResult log - 1: ', receiveResult);
        if (!receiveResult) {
            return res_.send({ result: false, error: 'Receive NFT failed!' });
        }

        console.log("listNewNfts log - 2 : ", _preHashStr);
        const _hashStr = createHash('sha256').update(_preHashStr).digest('hex');
        console.log("listNewNfts log - 3 : ", _hashStr);

        if (_type == "provider") {
            await OfferList.findOneAndUpdate(
                { _id: _offerId },
                { providerSwapId: _hashStr }
            );
        }
        else if (_type == "receiver") {
            await OfferList.findOneAndUpdate(
                { _id: _offerId },
                { receiverSwapId: _hashStr }
            );
        }

        const newSwapCollection = new SwapCollection({
            swapId: _hashStr,
            accountId: _accountId,
            nftCount: _nftInfo.length,
            offerHbar: _hbarAmount,
            offerPal: _palAmount,
        });
        await newSwapCollection.save();

        for (let i = 0; i < _nftInfo.length; i++) {
            const _newStakedNft = new SwapNftList({
                swapId: _hashStr,
                accountId: _accountId,
                tokenId: _nftInfo[i].tokenId,
                serialNum: _nftInfo[i].serialNum
            });
            await _newStakedNft.save();

            await NftList.findOneAndUpdate(
                { token_id: _nftInfo[i].tokenId, serial_number: _nftInfo[i].serialNum },
                { owner: null }
            );
        }

        return res_.send({ result: true, data: "NFTs successfully staked." });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getListedNfts = async (req_, res_) => {
    try {
        const _swapId = atob(req_.query.swapId);
        const nftList = await SwapNftList.find({ swapId: _swapId });
        return res_.send({ result: true, data: nftList });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.claimRequest = async (req_, res_) => {
    console.log("claimRequest log - 1 : ", req_.body);
    try {
        const _swapId = atob(req_.body.swapId);
        const _swapListData = await SwapNftList.find({ swapId: _swapId });

        const _swapCollection = await SwapCollection.findOne({ swapId: _swapId });

        const claimResult = await claimTokenAndNfts(_swapCollection, _swapListData);

        if (!claimResult)
            return res_.send({ result: false, error: "approve failed!" });

        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.deleteCollection = async (req_, res_) => {
    try {
        const _swapId = atob(req_.body.swapId);
        const _offerId = atob(req_.body.offerId);
        const _accountId = atob(req_.body.accountId);
        const _state = atob(req_.body.state);

        const _deleteResult1 = await SwapNftList.deleteMany({ swapId: _swapId });
        console.log("deleteCollection log - 2 : ", _deleteResult1);

        const _deleteResult2 = await SwapCollection.deleteMany({ swapId: _swapId });
        console.log("deleteCollection log - 2 : ", _deleteResult2);

        //    const _deleteResult3 = await SwapData.deleteMany({ $or: [{ collectionOneSwapId: _swapId, status: "pending" }, { collectionTwoSwapId: _swapId, status: "pending" }] });
        const _deleteResult3 = await SwapData.deleteMany({ $or: [{ collectionOneSwapId: _swapId }, { collectionTwoSwapId: _swapId }] });
        console.log("deleteCollection log - 2 : ", _deleteResult3);

        if (_state == 'canceled') {
            await OfferList.findOneAndDelete({ _id: _offerId });
            await Notification.deleteMany({ alertId: _offerId });
        }
        else {
            await OfferList.findOneAndUpdate(
                { _id: _offerId, 'providerInfo.accountId': _accountId },
                { providerClaimed: true }
            );
    
            await OfferList.findOneAndUpdate(
                { _id: _offerId, 'receiverInfo.accountId': _accountId },
                { receiverClaimed: true }
            );
    
            const _offer = await OfferList.findOne({ _id: _offerId });

            if (_state == 'accepted') {
                let _nftCount = _offer.providerNfts.length + _offer.receiverNfts.length;
                let _totalHbar = _offer.providerToken.hbar + _offer.receiverToken.hbar;
                let _totalPal = _offer.providerToken.pal + _offer.receiverToken.pal;
                console.log(_nftCount, _totalHbar, _totalPal);

                // calculate score
                let playerInfo = await Account.findOne({ accountId: _accountId });
                await Account.findOneAndUpdate(
                  { accountId: _accountId },
                  {
                    totalLevelScore: playerInfo.totalLevelScore + 10*_nftCount
                  }
                );
            }

            if (_offer.providerClaimed == true && _offer.receiverClaimed == true) {
                await OfferList.findOneAndUpdate(
                    { _id: _offerId },
                    { state: 'end' }
                );       
                await Notification.deleteMany({ alertId: _offerId });
            }
        }

        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.approveSwapOffer = async (req_, res_) => {
    console.log("approveSwapOffer log - 1 : ", req_.body);
    try {
        const _providerAccountId = atob(req_.body.providerAccountId);
        const _receiverAccountId = atob(req_.body.receiverAccountId);
        const _providerSwapId = atob(req_.body.providerSwapId);
        const _receiverSwapId = atob(req_.body.receiverSwapId);

        // const _searchSwapDataResult1 = await SwapData.find({ collectionOneSwapId: _providerSwapId, collectionTwoSwapId: _receiverSwapId, status: "pending" });
        // if (_searchSwapDataResult1?.length <= 0)
        //     return res_.send({ result: false, error: "Swap offer not exist!" });

        // provider swap collection
        const _tempSwapCollection1 = await SwapCollection.findOne({ accountId: _providerAccountId, swapId: _providerSwapId });
        console.log("approveSwapOffer log - 2 : ", _tempSwapCollection1);
        if (!_tempSwapCollection1)
            return res_.send({ result: false, error: "Something wrong." });

        // receiver swap collection
        const _tempSwapCollection2 = await SwapCollection.findOne({ accountId: _receiverAccountId, swapId: _receiverSwapId });
        console.log("approveSwapOffer log - 3 : ", _tempSwapCollection2);
        if (!_tempSwapCollection2)
            return res_.send({ result: false, error: "Something wrong." });

        await SwapCollection.updateOne({ swapId: _tempSwapCollection1.swapId }, { accountId: _tempSwapCollection2.accountId });
        await SwapCollection.updateOne({ swapId: _tempSwapCollection2.swapId }, { accountId: _tempSwapCollection1.accountId });

        await SwapNftList.updateMany({ swapId: _tempSwapCollection1.swapId }, { accountId: _tempSwapCollection2.accountId });
        await SwapNftList.updateMany({ swapId: _tempSwapCollection2.swapId }, { accountId: _tempSwapCollection1.accountId });

        const newSwapData = new SwapData({
            collectionOneSwapId: _providerSwapId,
            collectionTwoSwapId: _receiverSwapId,
            status: "success",
            firstView: "yet"
        });
        await newSwapData.save();

        // await SwapData.updateOne({ collectionOneSwapId: _providerSwapId, collectionTwoSwapId: _receiverSwapId, status: "pending" }, { status: "success", firstView: "yet" });
        // await SwapData.deleteMany({ collectionOneSwapId: _providerSwapId, status: "pending" });
        // await SwapData.deleteMany({ collectionOneSwapId: _receiverSwapId, status: "pending" });
        // console.log("approveSwapOffer log - 4");

        return res_.send({ result: true, messages: "Success" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.loadStakedNfts = async (req_, res_) => {
    console.log("loadStakedNfts log - 1 : ", req_.query);
    console.log("---------------------------------------------------------------------");

    try {
        const _accountId = atob(req_.query.accountId);

        const _stakedNfts = await SwapNftList.find({ accountId: _accountId });
        if (!_stakedNfts)
            return res_.send({ result: false, error: "Something wrong with load staked NFTs." });

        let _stakedNftInfo = [];
        for (let i = 0; i < _stakedNfts.length; i++) {
            console.log("loadStakedNfts log - 2 : ", parseInt((Date.now() - _stakedNfts[i].createdAt) / 86400000));
            let _stakedDays = parseInt((Date.now() - _stakedNfts[i].createdAt) / 86400000);

            _stakedNftInfo.push({
                tokenId: _stakedNfts[i].tokenId,
                serialNum: _stakedNfts[i].serialNum,
                stakedDays: _stakedDays
            })
        }
        console.log("loadStakedNfts log 3 ", _stakedNftInfo);

        return res_.send({ result: true, data: _stakedNftInfo });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.buyPalToken = async (req_, res_) => {
    try {
        const _accountId = atob(req_.body.a);
        const _hbarAmount = atob(req_.body.b);
        const _palAmount = atob(req_.body.c);
        const _playerId = atob(req_.body.d);

        if (!_accountId)
            return res_.send({ result: false, error: "Invalid post data!" });

        //save history
        const history = new PalTokenSaleHistory({
            accountId: _accountId,
            playerId: _playerId,
            hbar: _hbarAmount,
            pal: _palAmount,
            status: 'created'
        });
        const new_history = await history.save();

        // const allowanceResult = await getAllowance(_accountId, _hbarAmount);

        // if (!allowanceResult)
        //     return res_.send({ result: false, error: "Something wrong with - allowance" });

        const receiveResult = await receiveAllowanceHbar(_accountId, _hbarAmount);

        if (!receiveResult) {
            //update history
            await PalTokenSaleHistory.findOneAndUpdate(
                { _id: new_history._id },
                { status: 'hbar transfer error' }
            );

            return res_.send({ result: false, error: 'Send Hbar failed! After 5 minute, we are going to try.' });
        }

        const palResult = await palTokenTransfer(_accountId, _palAmount);

        if (!palResult) {
            //update history
            await PalTokenSaleHistory.findOneAndUpdate(
                { _id: new_history._id },
                { status: 'pal transfer error' }
            );

            return res_.send({ result: false, error: 'Buy Pal token failed! After 5 minute, we are going to try.' });
        }

        //success
        //update history
        await PalTokenSaleHistory.findOneAndUpdate(
            { _id: new_history._id },
            { status: 'success' }
        );

        let playerInfo = await Account.findOne({ accountId: _accountId });
        await Account.findOneAndUpdate(
          { accountId: _accountId },
          {
            totalLevelScore: playerInfo.totalLevelScore + parseInt(_hbarAmount, 10)
          }
        );
        
        return res_.send({ result: true, data: "success" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.buyBuilding = async (req_, res_) => {
    try {
        const _address = atob(req_.body.a);
        const _pos = atob(req_.body.b);
        const _accountId = atob(req_.body.c);
        const _buildingIndex = atob(req_.body.d);
        const _palAmount = atob(req_.body.e);
        const _playerId = atob(req_.body.f);

        if (!_address || !_pos || !_accountId || !_palAmount)
            return res_.send({ result: false, error: "Invalid post data!" });

        //save history
        const history = new BuyBuildingHistory({
            address: _address,
            pos: _pos,
            accountId: _accountId,
            playerId: _playerId,
            buildingIndex: _buildingIndex,
            pal: _palAmount
        });
        const new_history = await history.save();

        const receiveResult = await receiveAllowancePAL(_accountId, _palAmount);

        if (!receiveResult) {
            //update history
            await BuyBuildingHistory.findOneAndUpdate(
                { _id: new_history._id },
                { status: 'send pal error' }
            );

            return res_.send({ result: false, error: 'Send PAL token failed! After 5 minute, we are going to try.' });
        }

        //update history
        await BuyBuildingHistory.findOneAndUpdate(
            { _id: new_history._id },
            { status: 'success' }
        );

        // get building score
        const _buildingData = await Building.findOne({ index: _buildingIndex });

        // Increase the score of the place
        let place = await Place.findOne({ address: _address, pos: _pos });
        await Place.findOneAndUpdate(
            { address: place.address, pos: place.pos },
            {
                score: place.score + _buildingData.score
            }
        );

        // let playerInfo = await Account.findOne({ accountId: _accountId });
        // await Account.findOneAndUpdate(
        //   { accountId: _accountId },
        //   {
        //     totalLevelScore: playerInfo.totalLevelScore + _buildingData.score
        //   }
        // );
        
        // save building data in db
        const info = new BuyBuilding({
            address: _address,
            pos: _pos,
            accountId: _accountId,
            index: _buildingIndex
        });
        await info.save();

        return res_.send({ result: true, data: "success" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}