const mongoose = require('mongoose');

const websiteVisitSchema = new mongoose.Schema({
  page: { type: String },
  referrer: { type: String },
  userAgent: { type: String },
  ip: { type: String },
  screenWidth: { type: Number },
  screenHeight: { type: Number },
  visitedAt: { type: Date, default: Date.now },
}, { collection: 'websiteVisits', timestamps: true });

// ─── Indexes ──────────────────────────────────────
websiteVisitSchema.index({ visitedAt: -1 });

// Force delete stale cached model so collection name change takes effect
delete mongoose.models.WebsiteVisit;

module.exports = mongoose.model('WebsiteVisit', websiteVisitSchema);
