const mongoose = require('mongoose');
const SwapNftListSchema = new mongoose.Schema(
  {
    swapId: { type: String, default: "" },
    accountId: { type: String, default: "0.0.0" },
    tokenId: { type: String, default: "0.0.0" },
    serialNum: { type: String, default: "0" },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('SwapNftList', SwapNftListSchema);
