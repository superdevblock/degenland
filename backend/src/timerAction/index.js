const { receiveAllowanceNftsAndToken, sendHbar, sendNft, associateCheck, setAssociate, getAllowance, claimTokenAndNfts, receiveAllowanceHbar, receiveAllowancePAL, palTokenTransfer } = require('../api/chainAction');

const {
    Client,
    AccountId,
    PrivateKey,
    TokenId,
    TransactionId,
    TransferTransaction,
    TokenAssociateTransaction,
    Hbar,
    NftId,
    AccountAllowanceApproveTransaction,
} = require('@hashgraph/sdk');

const axios = require('axios');

const PalTokenSaleHistory = require('../models/PalTokenSaleHistory');
const BuyBuildingHistory = require('../models/BuyBuildingHistory');
const BuyBuilding = require('../models/BuyBuilding');
const Building = require('../models/Building');
const Place = require('../models/Place');
const RewardInfo = require('../models/RewardInfo');
const Account = require('../models/Account');
const NftList = require('../models/NftList');

exports.updateAccountLevel = async () => {
    const _accountInfo = await Account.find({});
    for (let i = 0; i < _accountInfo.length; i++) {
        let level = 1;
        let nextLevel = 2;
        let targetLevelScore = 500;
        let totalLevelScore = _accountInfo[i].totalLevelScore;
        let nftHolderScore = _accountInfo[i].degenlandCount*2000 + _accountInfo[i].investorCount*250;
        let placesScore = 0;
        // calculate place score
        const nftlist = await NftList.find({ owner: _accountInfo[i].accountId });
        for (let j = 0; j < nftlist.length; j++) {
            const placeInfo = await Place.findOne({ token_id: nftlist[j].token_id, serialNumber: nftlist[j].serial_number });
            totalLevelScore += placeInfo.score;
            placesScore += placeInfo.score;
        }

        // calculate friend info
        for (let j = 0; j < _accountInfo[i].friendList.length; j++) {
            totalLevelScore += 5;
        }
        let currentLevelScore = totalLevelScore + nftHolderScore;

        while (targetLevelScore <= currentLevelScore) {
            level++;
            nextLevel++;
            currentLevelScore -= targetLevelScore;
            targetLevelScore += 500;
        }

        await Account.findOneAndUpdate(
            { accountId: _accountInfo[i].accountId },
            {
                level: level,
                nextLevel: nextLevel,
                currentLevelScore: currentLevelScore,
                targetLevelScore: targetLevelScore,
                nftHolderScore: nftHolderScore,
                placesScore: placesScore
            }
        );
    }
    const _newAccountInfo = await Account.find({});
    return _newAccountInfo;
}

exports.getTotalRewardAmount = async () => {
    let g_hbarBalance;
    const operatorId = AccountId.fromString(process.env.TREASURY_ID);

    let g_hbarBalanceInfo = await axios.get("https://mainnet-public.mirrornode.hedera.com/api/v1/balances?account.id=" + operatorId.toString());
    if (!g_hbarBalanceInfo || g_hbarBalanceInfo.data.balances?.length === 0) {
        g_hbarBalance = 0;
    }
    else {
        g_hbarBalance = parseInt(g_hbarBalanceInfo.data.balances[0].balance, 10);
    }
//    g_hbarBalance = g_hbarBalance*(4/5);
    return g_hbarBalance;
}

exports.calculateReward = async (accountInfo, rewardAmount) => {
    let totalLevel = 0;
    for (let i = 0;i < accountInfo.length;i++) {
        if (accountInfo[i].level > 1)
            totalLevel += accountInfo[i].level;
    }
    if (totalLevel != 0) {
        for (let i = 0;i < accountInfo.length;i++) {
            if (accountInfo[i].level > 1) {
                const _accountId = accountInfo[i].accountId;
                const _playerId = accountInfo[i].playerId;
                const _hbarAmount = rewardAmount*(accountInfo[i].level/totalLevel);
        
                const _rewardInfo = new RewardInfo({
                    accountId: _accountId,
                    playerId: _playerId,
                    hbarAmount: parseFloat(_hbarAmount / (10 ** 8)).toFixed(3)
                });
                await _rewardInfo.save();
            }
        }
    }
}

exports.buyBuilding = async (failedBuyBuildingResult) => {
    for (let i = 0; i < failedBuyBuildingResult.length; i++) {
        const _address = failedBuyBuildingResult[i].address;
        const _pos = failedBuyBuildingResult[i].pos;
        const _accountId = failedBuyBuildingResult[i].accountId;
        const _buildingIndex = failedBuyBuildingResult[i].buildingIndex;
        const _palAmount = failedBuyBuildingResult[i].pal;

        const receiveResult = await receiveAllowancePAL(_accountId, _palAmount);
        console.log(receiveResult);

        if (!receiveResult) {
            //update history
            await BuyBuildingHistory.findOneAndUpdate(
                { _id: failedBuyBuildingResult[i]._id },
                { status: 'send pal error' }
            );
        }
        else {
            //update history
            await BuyBuildingHistory.findOneAndUpdate(
                { _id: failedBuyBuildingResult[i]._id },
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

            // save building data in db
            const info = new BuyBuilding({
                address: _address,
                pos: _pos,
                accountId: _accountId,
                index: _buildingIndex
            });
            await info.save();
        }
    }
}

exports.buyPalToken = async (failedPalTokenSaleResult) => {
    console.log(failedPalTokenSaleResult.length);
    for (let i = 0; i < failedPalTokenSaleResult.length; i++) {
        const _accountId = failedPalTokenSaleResult[i].accountId;
        const _hbarAmount = failedPalTokenSaleResult[i].hbar;
        const _palAmount = failedPalTokenSaleResult[i].pal;

        if (failedPalTokenSaleResult[i].status == 'hbar transfer error') {
            console.log('hbar transfer error');
            console.log(_accountId, _hbarAmount);
            const receiveResult = await receiveAllowanceHbar(_accountId, _hbarAmount);

            if (!receiveResult) {
                //update history
                await PalTokenSaleHistory.findOneAndUpdate(
                    { _id: failedPalTokenSaleResult[i]._id },
                    { status: 'hbar transfer error' }
                );
            }
            else {
                console.log('hbar transfer success');
                const palResult = await palTokenTransfer(_accountId, _palAmount);
                if (!palResult) {
                    //update history
                    await PalTokenSaleHistory.findOneAndUpdate(
                        { _id: failedPalTokenSaleResult[i]._id },
                        { status: 'pal transfer error' }
                    );
                }
                else {
                    console.log('pal transfer success');
                    //success
                    //update history
                    await PalTokenSaleHistory.findOneAndUpdate(
                        { _id: failedPalTokenSaleResult[i]._id },
                        { status: 'success' }
                    );
                }
            }
        }
        else if (failedPalTokenSaleResult[i].status == 'pal transfer error') {
            console.log('pal transfer error');
            console.log(_accountId, _palAmount);
            const palResult = await palTokenTransfer(_accountId, _palAmount);
            if (!palResult) {
                //update history
                await PalTokenSaleHistory.findOneAndUpdate(
                    { _id: failedPalTokenSaleResult[i]._id },
                    { status: 'pal transfer error' }
                );
            }
            else {
                console.log('pal transfer success');
                //success
                //update history
                await PalTokenSaleHistory.findOneAndUpdate(
                    { _id: failedPalTokenSaleResult[i]._id },
                    { status: 'success' }
                );
            }
        }
    }
}