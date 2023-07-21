const { claimToken } = require('../chainAction');

const RewardInfo = require('../../models/RewardInfo');

exports.getRewardAmount = async (req_, res_) => {
    try {
        const _accountId = req_.query.accountId;

        const _rewardResult = await RewardInfo.findOne({ accountId: _accountId });
        if (!_rewardResult)
            return res_.send({ result: false, error: 'No reward' });
        return res_.send({ result: true, data: _rewardResult.hbarAmount });
    } catch (err) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.claimRequest = async (req_, res_) => {
    try {
        const _accountId = atob(req_.body.a);
        const _hbarAmount = atob(req_.body.b);

        const claimResult = await claimToken(_accountId, _hbarAmount);
        console.log("claimResult", claimResult);

        if (!claimResult)
            return res_.send({ result: false, error: "approve failed!" });

        return res_.send({ result: true, data: "success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getClaimState = async (req_, res_) => {
    try {
        const _accountId = req_.query.accountId;

        const _rewardResult = await RewardInfo.findOne({ accountId: _accountId, status: 'claimable' });
        console.log("getClaimState", _rewardResult);
        if (!_rewardResult)
            return res_.send({ result: true, data: false });
        return res_.send({ result: true, data: true });
    } catch (err) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.setClaimState = async (req_, res_) => {
    try {
        const _accountId = req_.body.accountId;
        const _status = req_.body.status;

        await RewardInfo.findOneAndUpdate(
            { accountId: _accountId },
            { status: _status }
        );
        return res_.send({ result: true, msg: 'success!' });
    } catch (err) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}