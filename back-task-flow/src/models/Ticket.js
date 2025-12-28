// src/models/Ticket.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['A faire', 'En cours', 'En validation', 'Terminé'],
      default: 'A faire',
    },
    estimationDate: { type: Date, required: true },
    project:   { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }], // une ou plusieurs personnes
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // créateur du ticket
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
