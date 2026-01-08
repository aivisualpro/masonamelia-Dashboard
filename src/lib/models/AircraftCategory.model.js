const mongoose = require("mongoose");

const aircraftCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.AircraftCategory || mongoose.model("AircraftCategory", aircraftCategorySchema);
