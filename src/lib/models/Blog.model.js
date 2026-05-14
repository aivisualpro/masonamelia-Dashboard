const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" },
    coverImage: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
    description: { type: String },
  },
  { timestamps: true }
);

// Text index for search (title + content)
BlogSchema.index({ title: 'text' });
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ category: 1 });

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
