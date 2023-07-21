const mongoose = require('mongoose');
const NormalNftListSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  token_id: { type: String, default: "" },
  serialNum: { type: Number, default: -1 },
  imgUrl: { type: String, default: "" },
  owner: { type: String, default: "" },
  creator: { type: String, default: "" },
  fallback: { type: Number, default: -1 },
  ticked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = User = mongoose.model('NormalNftList', NormalNftListSchema);
