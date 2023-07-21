const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const FurnitureSchema = new mongoose.Schema({
    buildingId: { type: ObjectId },
    address: { type: String, default: '' },
    pos: { type: String, default: '' },
    sno: { type: Number, default: 0 },
    type: { type: Number, default: 0 },
    name: { type: String, default: '' }
}, { timestamps: true });

module.exports = User = mongoose.model('Furniture', FurnitureSchema);
