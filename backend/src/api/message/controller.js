const PrivateMessage = require('../../models/PrivateMessage');

exports.getMessageList = async (req, res) => {
  try {
    if (!req.query.accountId) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let accountId = req.query.accountId;

      let _messageList = await PrivateMessage.find({ $or: [{ senderAccountId: accountId }, { receiverAccountId: accountId }] }).sort({ createdAt: -1 });

      //send response
      res.send({
        status: true,
        message: 'Success',
        data: _messageList
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}