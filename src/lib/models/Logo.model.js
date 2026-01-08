const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.models.Logo || mongoose.model("Logo", logoSchema);
