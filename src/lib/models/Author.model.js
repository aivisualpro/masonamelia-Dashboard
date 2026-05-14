const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
  },
  { timestamps: true }
);

AuthorSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Author || mongoose.model('Author', AuthorSchema);