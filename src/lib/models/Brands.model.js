const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
