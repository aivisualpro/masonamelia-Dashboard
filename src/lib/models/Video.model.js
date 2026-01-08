const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    src: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.models.Video || mongoose.model("Video", videoSchema);
