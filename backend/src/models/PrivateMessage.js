const mongoose = require('mongoose');
const PrivateMessageSchema = new mongoose.Schema(
  {
    senderAccountId: { type: String, default: "" },
    receiverAccountId: { type: String, default: "" },
    chatContent: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('PrivateMessage', PrivateMessageSchema);
