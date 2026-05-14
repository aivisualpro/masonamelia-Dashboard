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

// ─── Indexes ──────────────────────────────────────
aircraftCategorySchema.index({ slug: 1 }, { unique: true });  // Slug lookups
aircraftCategorySchema.index({ name: 1 });                     // Sort by name

module.exports = mongoose.models.AircraftCategory || mongoose.model("AircraftCategory", aircraftCategorySchema);
