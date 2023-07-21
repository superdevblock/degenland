const mongoose = require('mongoose');
const PlacementSchema = new mongoose.Schema({
  address: { type: String, required: true },
  pos: { type: String, required: true },
  ticketId: { type: String, default: null},
  imgUrl: { type: String, default: '' },
  sno: { type: Number, required: true },
  type: { type: Number, required: true },
  userCount: { type: Number, default: 0 },
  buildingType: { type: String, required: true },
  built: { type: Boolean, required: true },
  remaintime: { type: Number, default: 0 },
  ads: { type: String },
  mimetype: { type: String, default: '' },
  linkurl: { type: String, default: '' },
  owner: { type: String },
  name: { type: String, default: '' },
  sizex: { type: Number, default: 0 },
  sizey: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = User = mongoose.model('Placement', PlacementSchema);
