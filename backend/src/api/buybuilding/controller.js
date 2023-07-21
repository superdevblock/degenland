const BuyBuilding = require('../../models/BuyBuilding');

exports.getState = async (req, res) => {
    try {
        const _address = atob(req.query.address);
        const _pos = atob(req.query.pos);
        const _accountId = atob(req.query.accountId);

        if (!_address || !_pos || !_accountId)
            return res.send({ result: false, error: "Invalid get data!" });

        const _stateData = await BuyBuilding.find({ address: _address, pos: _pos, accountId: _accountId });
//        const _stateData = await BuyBuilding.find({ accountId: _accountId });
        return res.send({ result: true, data: _stateData });
    } catch (err) {
        return res.send({ result: false, error: 'Error detected in server progress!' });
    }
}
