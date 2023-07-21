const mongoose = require('mongoose');
const NftListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token_id: { type: String, default: null },
  serial_number: { type: Number, required: true },
  owner: { type: String, default: null },
}, { timestamps: true });

module.exports = User = mongoose.model('NftList', NftListSchema);
