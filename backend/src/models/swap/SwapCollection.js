const mongoose = require('mongoose');
const SwapCollectionSchema = new mongoose.Schema(
  {
    swapId: { type: String, default: "" },
    accountId: { type: String, default: "0.0.0" },
    nftCount: { type: Number, default: 0 },
//    offerCount: { type: Number, default: 0 },
//    offerType: { type: Number, default: 0 },
    offerHbar: { type: Number, default: 0 },
    offerPal: { type: Number, default: 0 },
//    memoStr: { type: String, default: 0 },
//    isListed: { type: Number, default: 0 },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('SwapCollection', SwapCollectionSchema);
