const mongoose = require('mongoose');

const BlogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    slug: { type: String, trim: true },
  },
  { timestamps: true }
);

BlogCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
BlogCategorySchema.index({ createdAt: -1 });

module.exports = mongoose.models.BlogCategory || mongoose.model('BlogCategory', BlogCategorySchema);