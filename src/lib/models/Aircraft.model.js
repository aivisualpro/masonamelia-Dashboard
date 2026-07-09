const mongoose = require("mongoose");

const aircraftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    year: { type: Number },
    price: { type: Number },
    status: {
      type: String,
      enum: [
        "for-sale",
        "sold",
        "wanted",
        "coming-soon",
        "sale-pending",
        "off-market",
        "acquired",
      ],
    },
    latitude: { type: String },
    longitude: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "AircraftCategory" },
    airframe: { type: Number },
    engine: { type: Number },
    engineTwo: { type: Number },
    propeller: { type: Number },
    propellerTwo: { type: Number },
    overview: { type: String },
    description: {
      version: { type: Number, default: 1 },
      sections: {
        type: Map,
        of: new mongoose.Schema({ html: String, text: String, items: [String] }, { _id: false }),
        default: {} // <- important
      }
    },
    contactAgent: { name: String, phone: String, email: String },
    images: [String],
    featuredImage: { type: String },
    videoUrl: { type: String },
    location: { type: String },
    index: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes for query performance ──────────────────────────────────────
aircraftSchema.index({ createdAt: -1 });               // All list endpoints sort by createdAt desc
aircraftSchema.index({ status: 1 });                    // Status filter + analytics countDocuments
aircraftSchema.index({ status: 1, price: 1 });          // Analytics: inventory value aggregation
aircraftSchema.index({ category: 1 });                  // Category lookups & aggregation
aircraftSchema.index({ createdAt: -1, status: 1 });     // Combined sort + filter

module.exports = mongoose.models.Aircraft || mongoose.model("Aircraft", aircraftSchema);
