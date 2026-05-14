const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    src: {
        type: String,
        required: true,
    },
}, { timestamps: true });

videoSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Video || mongoose.model("Video", videoSchema);
