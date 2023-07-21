const mongoose = require('mongoose');
const OfferListSchema = new mongoose.Schema({
  providerSwapId: { type: String, default: "" },
  providerClaimed: { type: Boolean, default: false },
  providerClaimApproved: { type: Boolean, default: false },
  providerClaimTime: { type: Date, default: '' },
  providerInfo: {
    accountId: { type: String, default: "" },
    playerId: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    connectState: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    currentLevelScore: {type: Number, default: 0},
    targetLevelScore: {type: Number, default: 50},
  },
  providerToken: {
    hbar: { type: Number, default: 0 },
    pal: { type: Number, default: 0 }
  },
  providerNfts: [
    {
      tokenId: { type: String, default: "" },
      serialNum: { type: Number, default: -1 },
      fallback: { type: Number, default: 0 },
      nft_type: { type: String, default: "LandNft" },
      imgUrl: { type: String, default: "" },
      creator: { type: String, default: "" },
      name: { type: String, default: "" },
      buildingCount: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      totalVisitor: { type: Number, default: 0 }
    }
  ],
  receiverSwapId: { type: String, default: "" },
  receiverClaimed: { type: Boolean, default: false },
  receiverClaimApproved: { type: Boolean, default: false },
  receiverClaimTime: { type: Date, default: '' },
  receiverInfo: {
    accountId: { type: String, default: "" },
    playerId: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    connectState: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    currentLevelScore: {type: Number, default: 0},
    targetLevelScore: {type: Number, default: 50},
  },
  receiverToken: {
    hbar: { type: Number, default: 0 },
    pal: { type: Number, default: 0 }
  },
  receiverNfts: [
    {
      tokenId: { type: String, default: "" },
      serialNum: { type: Number, default: -1 },
      fallback: { type: Number, default: 0 },
      nft_type: { type: String, default: "LandNft" },
      imgUrl: { type: String, default: "" },
      creator: { type: String, default: "" },
      name: { type: String, default: "" },
      buildingCount: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      totalVisitor: { type: Number, default: 0 }
    }
  ],
  state: { type: String, required: true, default: 'new' },
  claimableState: { type: Boolean, default: false },
  step: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = User = mongoose.model('OfferList', OfferListSchema);
