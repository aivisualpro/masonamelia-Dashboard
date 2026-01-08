const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Author || mongoose.model('Author', AuthorSchema);