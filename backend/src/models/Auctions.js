const mongoose = require('mongoose');
const AuctionsSchema = new mongoose.Schema({
  owner_accountid: { type: String, default: '' },
  owner_playerid: { type: String, default: '' },
  token_id: { type: String, default: '' },
  serial_number: { type: Number, default: -1 },
  current_auction_price: { type: Number, default: 0 },
  start_auction_price: { type: Number, default: 0 },
  minimum_auction_price: { type: Number, default: 0 },
  current_round: { type: Number, default: 1 },
  name: { type: String, default: '' },
  creator: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = User = mongoose.model('Auctions', AuctionsSchema);
