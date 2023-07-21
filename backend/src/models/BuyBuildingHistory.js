const mongoose = require('mongoose');
const BuyBuildingHistorySchema = new mongoose.Schema({
  accountId: { type: String, default: '' },
  playerId: { type: String, default: '' },
  address: { type: String, default: '' },
  pos: { type: String, default: '' },
  buildingIndex: { type: Number, default: -1 },
  pal: { type: Number, default: 0 },
  status: { type: String, default: 'created' }
}, { timestamps: true });

module.exports = User = mongoose.model('BuyBuildingHistory', BuyBuildingHistorySchema);
