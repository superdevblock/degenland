const mongoose = require('mongoose');
const MarketplaceSchema = new mongoose.Schema({
  owner_accountid: { type: String, default: '' },
  owner_playerid: { type: String, default: '' },
  collection_name: { type: String, default: '' },
  token_id: { type: String, default: '' },
  serial_number: { type: Number, default: -1 },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  name: { type: String, default: '' },
  creator: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  favourites: { type: Number, default: 0 },
  favouritesList: {type: Array, default: []},
  watching: { type: Number, default: 0 },
  watchingList: {type: Array, default: []},
}, { timestamps: true });

module.exports = User = mongoose.model('Marketplace', MarketplaceSchema);
