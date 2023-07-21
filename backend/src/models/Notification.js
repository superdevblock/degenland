const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  isBroadcast: { type: Boolean, default: false },
  accountId: { type: String, default: "" },
  playerId: { type: String, default: "" },
  alertType: { type: String, default: "" },
  alertId: { type: ObjectId },
  playerInfo: {
    accountId: { type: String, default: "" },
    playerId: { type: String, default: "" },
    playerLvl: { type: Number, default: 1 },
    lvlProcess: { type: Number, default: 0 },
    friendFlag: { type: Boolean, default: false },
    aliveFlag: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    degenlandNftCount: { type: Number, default: 0 },
    tycoonNftCount: { type: Number, default: 0 },
    mogulNftCount: { type: Number, default: 0 },
    investorNftCount: { type: Number, default: 0 }
  },
  message: { type: String, default: '' },
  state: { type: String, default: 'unread' },
}, { timestamps: true });

module.exports = User = mongoose.model('Notification', NotificationSchema);
