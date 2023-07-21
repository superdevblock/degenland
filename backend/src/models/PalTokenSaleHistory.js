const mongoose = require('mongoose');
const PalTokenSaleHistorySchema = new mongoose.Schema({
  accountId: { type: String, default: "" },
  playerId: { type: String, default: '' },
  hbar: { type: Number, default: 0 },
  pal: { type: Number, default: 0 },
  status: { type: String, default: "" }
}, { timestamps: true });

module.exports = User = mongoose.model('PalTokenSaleHistory', PalTokenSaleHistorySchema);
