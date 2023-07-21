const { transferNFT, associateCheck, setAssociate, receiveAllowanceNftAndHbar, allowanceNft } = require('../chainAction');

const Auctions = require('../../models/Auctions');
const SoldNftList = require('../../models/SoldNftList');
const Account = require('../../models/Account');

exports.getList = async (req_, res_) => {
    try {
        const _nftList = await Auctions.find({});
        return res_.send({ result: true, data: _nftList });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.checkNft = async (req_, res_) => {
    try {
        if (!req_.query.token_id || !req_.query.serial_number)
            return res_.send({ result: false, error: 'failed' });
        const _tokenId = req_.query.token_id;
        const _serialNumber = req_.query.serial_number;
        const _nftInfo = await Auctions.findOne({ token_id: _tokenId, serial_number: _serialNumber });
        if (!_nftInfo)
            return res_.send({ result: true, data: { status: false } });
        return res_.send({ result: true, data: { status: true, id: _nftInfo._id } });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getItemDetail = async (req_, res_) => {
    try {
        if (!req_.query.id)
            return res_.send({ result: false, error: 'failed' });
        const _id = req_.query.id;
        const _nftInfo = await Auctions.findOne({ _id: _id });
        return res_.send({ result: true, data: _nftInfo });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getListByAccountId = async (req_, res_) => {
    try {
        if (!req_.query.accountId)
            return res_.send({ result: false, error: 'failed' });
        const _accountId = req_.query.accountId;
        const _nftList = await Auctions.find({ owner_accountid: _accountId });
        return res_.send({ result: true, data: _nftList });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.setList = async (req_, res_) => {
    try {
        if (!req_.body.owner_accountid || !req_.body.token_id || !req_.body.serial_number || !req_.body.name || !req_.body.creator || !req_.body.imageUrl)
            return res_.send({ result: false, error: 'failed' });
        const _ownerAccountId = req_.body.owner_accountid;
        const _tokenId = req_.body.token_id;
        const _serialNumber = req_.body.serial_number;
        const _hbarAmount = req_.body.hbar_amount;
        const _start_auction_price = req_.body.start_auction_price;
        const _minimum_auction_price = req_.body.minimum_auction_price;
        const _name = req_.body.name;
        const _creator = req_.body.creator;
        const _imageUrl = req_.body.imageUrl;

        // check associate
        const checkAssociate = await associateCheck(_tokenId);
        if (!checkAssociate) {
            const associateStatus = await setAssociate(_tokenId);
            if (!associateStatus)
                return res_.send({ result: false, error: "Error! The transaction was rejected, or failed! Please try again!" });
        }

        const receiveResult = await receiveAllowanceNftAndHbar(_ownerAccountId, _tokenId, _serialNumber, _hbarAmount);
        if (!receiveResult)
            return res_.send({ result: false, error: 'Error! The transaction was rejected, or failed! Please try again!' });

        // Get playerid
        const _ownerInfo = await Account.findOne({ accountId: _ownerAccountId });
        if (!_ownerInfo)
            return res_.send({ result: false, error: 'Unregistered account!' });

        const newNftList = new Auctions({
            owner_accountid: _ownerAccountId,
            owner_playerid: _ownerInfo.playerId,
            token_id: _tokenId,
            serial_number: _serialNumber,
            current_auction_price: _start_auction_price,
            start_auction_price: _start_auction_price,
            minimum_auction_price: _minimum_auction_price,
            current_round: 1,
            name: _name,
            creator: _creator,
            imageUrl: _imageUrl
        });
        await newNftList.save();

        return res_.send({ result: true, msg: 'success! Your NFT has been listed!' });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.cancelList = async (req_, res_) => {
    try {
        if (!req_.body.token_id || !req_.body.serial_number)
            return res_.send({ result: false, error: 'failed' });
        const _tokenId = req_.body.token_id;
        const _serialNumber = req_.body.serial_number;

        const _result = await Auctions.findOneAndDelete({ token_id: _tokenId, serial_number: _serialNumber });
        if (!_result)
            return res_.send({ result: false, error: "Error detected in server progress!" });
        return res_.send({ result: true, msg: 'success! Your NFT has been listed!' });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.approveAllowanceNft = async (req_, res_) => {
    try {
        if (!req_.body.account_id || !req_.body.token_id)
            return res_.send({ result: false, error: 'failed' });

        const _accountId = req_.body.account_id;
        const _tokenId = req_.body.token_id;
        const _serialNumber = req_.body.serial_number;

        const claimResult = await allowanceNft(_accountId, _tokenId, _serialNumber);
        if (!claimResult)
            return res_.send({ result: false, error: "Error! The transaction was rejected, or failed! Please try again!" });
        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.sendNft = async (req_, res_) => {
    try {
        if (!req_.body.a || !req_.body.b || !req_.body.c)
            return res_.send({ result: false, error: 'failed' });

        const _nftInfo = {
            token_id: atob(req_.body.a.d),
            serial_number: atob(req_.body.a.e),
        };
        const _buyerId = atob(req_.body.b);
        const _soldPrice = atob(req_.body.c);

        const _detailInfo = await Auctions.findOne({ token_id: _nftInfo.token_id, serial_number: _nftInfo.serial_number });
        const _buyerInfo = await Account.findOne({ accountId: _buyerId });
        _newSoldNftList = new SoldNftList({
            token_id: _detailInfo.token_id,
            serial_number: _detailInfo.serial_number,
            imageUrl: _detailInfo.imageUrl,
            name: _detailInfo.name,
            totalAmount: _soldPrice,
            transactionType: 'auction',
            buyer: _buyerInfo.playerId,
            seller: _detailInfo.owner_playerid,
            success: true
        });
        await _newSoldNftList.save();

        const _result = await Auctions.findOneAndDelete({ token_id: _nftInfo.token_id, serial_number: _nftInfo.serial_number });
        if (!_result)
            return res_.send({ result: false, error: "Error detected in server progress!" });
        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}
