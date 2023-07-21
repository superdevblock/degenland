const mongoose = require('mongoose');
const StakedNftsSchema = new mongoose.Schema(
  {
    accountId: { type: String, default: "0.0.0" },
    tokenId: { type: String, default: "0.0.0" },
    serialNum: { type: String, default: "0" },
    status: { type: String, default: "0" },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('StakedNfts', StakedNftsSchema);
