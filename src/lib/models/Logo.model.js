const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
}, { timestamps: true });

logoSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Logo || mongoose.model("Logo", logoSchema);
