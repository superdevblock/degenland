const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const RewardInfoSchema = new mongoose.Schema({
    accountId: { type: String, default: '' },
    playerId: { type: String, default: '' },
    hbarAmount: { type: Number, default: 0 },
    status: { type: String, default: "pending" },
    notificationId: { type: ObjectId }
}, { timestamps: true });

module.exports = User = mongoose.model('RewardInfo', RewardInfoSchema);
