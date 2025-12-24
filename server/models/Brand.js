const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    logoUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
