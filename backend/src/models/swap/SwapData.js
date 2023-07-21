const mongoose = require('mongoose');
const SwapDataSchema = new mongoose.Schema(
  {
    collectionOneSwapId: { type: String, default: "" },
    collectionTwoSwapId: { type: String, default: "" },
    status: { type: String, default: "pending" },
    firstView: { type: String, default: "yet" },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('SwapData', SwapDataSchema);
