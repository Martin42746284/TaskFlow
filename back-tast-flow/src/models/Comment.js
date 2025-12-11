// src/models/Comment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    ticket:  { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
