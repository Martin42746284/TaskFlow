// src/models/Project.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Actif', 'Inactif', 'Archivé'],
      default: 'Actif',
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // créateur
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    team:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
