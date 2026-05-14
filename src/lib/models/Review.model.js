const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// ─── Indexes ──────────────────────────────────────
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
