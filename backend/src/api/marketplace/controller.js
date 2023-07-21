const { transferNFT, associateCheck, setAssociate, receiveAllowanceNftAndHbar, allowanceNft } = require('../chainAction');

const Marketplace = require('../../models/Marketplace');
const SoldNftList = require('../../models/SoldNftList');
const Account = require('../../models/Account');

exports.getItemDetail = async (req_, res_) => {
    try {
        if (!req_.query.id)
            return res_.send({ result: false, error: 'failed' });
        const _id = req_.query.id;
        const _nftInfo = await Marketplace.findOne({ _id: _id });
        return res_.send({ result: true, data: _nftInfo });
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
        const _nftInfo = await Marketplace.findOne({ token_id: _tokenId, serial_number: _serialNumber });
        if (!_nftInfo)
            return res_.send({ result: true, data: { status: false } });
        return res_.send({ result: true, data: { status: true, id: _nftInfo._id } });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getList = async (req_, res_) => {
    try {
        const _pageNumber = req_.query.pageNumber;
        const _displayCount = req_.query.displayCount;

        const _totalNftList = await Marketplace.find({});
        const _nftList = await Marketplace.find({}).sort({ createdAt: -1 }).skip((_pageNumber - 1) * _displayCount).limit(_displayCount);
        return res_.send({ result: true, totalCount: _totalNftList.length, data: _nftList });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getCollectionList = async (req_, res_) => {
    try {
        const _nftList = await Marketplace.find({});
        let _collectionData = [];
        for (let i = 0; i < _nftList.length; i++) {
            let _collectionName = _nftList[i].collection_name;
            let _flag = 0;
            for (let j = 0; j < _collectionData.length; j++) {
                if (_collectionName == _collectionData[j].collectionName)
                    _flag = 1;
            }
            if (_flag == 0) {
                let _floorPrice = _nftList[i].price;
                let _totalVolume = 0;
                for (let j = 0; j < _nftList.length; j++) {
                    if (_collectionName == _nftList[j].collection_name) {
                        _totalVolume += _nftList[j].price;
                        if (_floorPrice > _nftList[j].price)
                            _floorPrice = _nftList[j].price;
                    }
                }
                const _collectionInfo = {
                    token_id: _nftList[i].token_id,
                    imageUrl: _nftList[i].imageUrl,
                    collectionName: _collectionName,
                    floorPrice: _floorPrice,
                    totalVolume: _totalVolume
                };
                _collectionData.push(_collectionInfo);
            }
        }
        return res_.send({ result: true, data: _collectionData });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getListByAccountId = async (req_, res_) => {
    try {
        if (!req_.query.accountId)
            return res_.send({ result: false, error: 'failed' });
        const _accountId = req_.query.accountId;
        const _nftList = await Marketplace.find({ owner_accountid: _accountId });
        return res_.send({ result: true, data: _nftList });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.setList = async (req_, res_) => {
    try {
        if (!req_.body.owner_accountid || !req_.body.token_id || !req_.body.serial_number || !req_.body.price)
            return res_.send({ result: false, error: 'failed' });
        const _ownerAccountId = req_.body.owner_accountid;
        const _collectionName = req_.body.collection_name;
        const _tokenId = req_.body.token_id;
        const _serialNumber = req_.body.serial_number;
        const _description = req_.body.description;
        const _hbarAmount = req_.body.hbar_amount;
        const _price = req_.body.price;
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

        const newNftList = new Marketplace({
            owner_accountid: _ownerAccountId,
            owner_playerid: _ownerInfo.playerId,
            collection_name: _collectionName,
            token_id: _tokenId,
            serial_number: _serialNumber,
            description: _description,
            price: _price,
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

        const _result = await Marketplace.findOneAndDelete({ token_id: _tokenId, serial_number: _serialNumber });
        if (!_result)
            return res_.send({ result: false, error: "Error detected in server progress!" });
        return res_.send({ result: true, msg: 'success! Your NFT has been listed!' });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.setFavourites = async (req_, res_) => {
    try {
        if (!req_.body.id || !req_.body.accountId)
            return res_.send({ result: false, error: 'failed' });
        const id = req_.body.id;
        const _accountId = req_.body.accountId;

        const _oldNftInfo = await Marketplace.findOne({ _id: id });
        _oldNftInfo.favouritesList.push(_accountId);

        const _newNftInfo = await Marketplace.findOneAndUpdate(
            { _id: id },
            {
                favourites: _oldNftInfo.favourites + 1,
                favouritesList: _oldNftInfo.favouritesList
            },
            { new: true }
        );
        return res_.send({ result: true, data: _newNftInfo });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.unsetFavourites = async (req_, res_) => {
    try {
        if (!req_.body.id || !req_.body.accountId)
            return res_.send({ result: false, error: 'failed' });
        const id = req_.body.id;
        const _accountId = req_.body.accountId;

        const _oldNftInfo = await Marketplace.findOne({ _id: id });
        for (let i = 0; i < _oldNftInfo.favouritesList.length; i++) {
            if (_oldNftInfo.favouritesList[i] == _accountId)
                _oldNftInfo.favouritesList.splice(i, 1);
        }

        const _newNftInfo = await Marketplace.findOneAndUpdate(
            { _id: id },
            {
                favourites: _oldNftInfo.favourites - 1,
                favouritesList: _oldNftInfo.favouritesList
            },
            { new: true }
        );
        return res_.send({ result: true, data: _newNftInfo });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.setWatching = async (req_, res_) => {
    try {
        if (!req_.body.id || !req_.body.accountId)
            return res_.send({ result: false, error: 'failed' });
        const id = req_.body.id;
        const _accountId = req_.body.accountId;

        const _oldNftInfo = await Marketplace.findOne({ _id: id });
        _oldNftInfo.watchingList.push(_accountId);

        const _newNftInfo = await Marketplace.findOneAndUpdate(
            { _id: id },
            {
                watching: _oldNftInfo.watching + 1,
                watchingList: _oldNftInfo.watchingList
            },
            { new: true }
        );
        return res_.send({ result: true, data: _newNftInfo });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.unsetWatching = async (req_, res_) => {
    try {
        if (!req_.body.id || !req_.body.accountId)
            return res_.send({ result: false, error: 'failed' });
        const id = req_.body.id;
        const _accountId = req_.body.accountId;

        const _oldNftInfo = await Marketplace.findOne({ _id: id });
        for (let i = 0; i < _oldNftInfo.watchingList.length; i++) {
            if (_oldNftInfo.watchingList[i] == _accountId)
                _oldNftInfo.watchingList.splice(i, 1);
        }

        const _newNftInfo = await Marketplace.findOneAndUpdate(
            { _id: id },
            {
                watching: _oldNftInfo.watching - 1,
                watchingList: _oldNftInfo.watchingList
            },
            { new: true }
        );
        return res_.send({ result: true, data: _newNftInfo });
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

        const _detailInfo = await Marketplace.findOne({ token_id: _nftInfo.token_id, serial_number: _nftInfo.serial_number });
        const _buyerInfo = await Account.findOne({ accountId: _buyerId });
        _newSoldNftList = new SoldNftList({
            token_id: _detailInfo.token_id,
            serial_number: _detailInfo.serial_number,
            imageUrl: _detailInfo.imageUrl,
            name: _detailInfo.name,
            totalAmount: _soldPrice,
            buyer: _buyerInfo.playerId,
            seller: _detailInfo.owner_playerid,
            success: true
        });
        await _newSoldNftList.save();

        const _result = await Marketplace.findOneAndDelete({ token_id: _nftInfo.token_id, serial_number: _nftInfo.serial_number });
        if (!_result)
            return res_.send({ result: false, error: "Error detected in server progress!" });
        return res_.send({ result: true, data: "success!" });
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

exports.getListByCollectionName = async (req_, res_) => {
    try {
        if (!req_.query.collectionName)
            return res_.send({ result: false, error: 'failed' });
        const _collectionName = req_.query.collectionName;
        const _nftList = await Marketplace.find({ collection_name: _collectionName });
        let _floor_price = _nftList[0].price;
        let _listed_count = 0;
        let _total_volume = 0;
        for (let i = 0;i < _nftList.length;i++) {
            _listed_count++;
            _total_volume += _nftList[i].price;
            if (_floor_price > _nftList[i].price)
                _floor_price = _nftList[i].price;
        }
        const _commonData = {
            collectionName: _nftList[0].collection_name,
            collectionImageUrl: _nftList[_nftList.length - 1].imageUrl,
            floorPrice: _floor_price,
            listedCount: _listed_count,
            totalVolume: _total_volume,
            avgSalePrice: (_total_volume/_listed_count).toFixed(2),
            description: _nftList[0].description
        }
        return res_.send({ result: true, common_data: _commonData, data: _nftList });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}
