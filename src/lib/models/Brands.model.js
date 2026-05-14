const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// ─── Indexes ──────────────────────────────────────
brandSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
