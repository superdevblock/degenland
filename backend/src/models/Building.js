const mongoose = require('mongoose');
const BuildingSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  name: { type: String, default: '' },
  cost: { type: Number, required: true },
  score: { type: Number, required: true },
  default: { type: Boolean, required: true },
  size: { type: String, required: true },
  buildtime: { type: Number, default: 0 },
  canEnter: { type: Boolean, default: false },
  canConstruct: { type: Boolean, default: false },
  sizex: { type: Number, default: 0 },
  sizey: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = User = mongoose.model('Building', BuildingSchema);
