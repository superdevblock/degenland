const mongoose = require('mongoose');
const BuyBuildingSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  pos: { type: String, default: '' },
  accountId: { type: String, default: '' },
  index: { type: Number, default: -1 },
}, { timestamps: true });

module.exports = User = mongoose.model('BuyBuilding', BuyBuildingSchema);
