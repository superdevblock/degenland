const mongoose = require('mongoose');
const SoldNftListSchema = new mongoose.Schema({
    token_id: { type: String, default: '' },
    serial_number: { type: Number, default: -1 },
    imageUrl: { type: String, default: '' },
    name: { type: String, default: '' },
    transactionType: { type: String, default: 'Sale' },
    totalAmount: { type: Number, default: 0 },
    buyer: { type: String, default: '' },
    seller: { type: String, default: '' },
    success: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = User = mongoose.model('SoldNftList', SoldNftListSchema);
