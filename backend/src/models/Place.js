const mongoose = require('mongoose');
const PlaceSchema = new mongoose.Schema({
  address: {
    type: String,
    default: ''
  },
  pos: {
    type: String,
    default: ''
  },
  name: { type: String, default: "" },
  token_id: {
    type: String,
    required: true
  },
  serialNumber: {
    type: Number,
    required: true
  },
  ownerInfo: {
    playerId: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    connectState: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    currentLevelScore: { type: Number, default: 0 },
    targetLevelScore: { type: Number, default: 0 },
    degenlandNftCount: { type: Number, default: 0 },
    tycoonNftCount: { type: Number, default: 0 },
    mogulNftCount: { type: Number, default: 0 },
    investorNftCount: { type: Number, default: 0 }
  },
  buildingCount: {
    type: Number, 
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  totalVisitor: {
    type: Number,
    default: 0,
  },
  currentVisitor: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = User = mongoose.model('Place', PlaceSchema);
