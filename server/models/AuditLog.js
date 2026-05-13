const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: {
    type: { type: String },
    id:   { type: mongoose.Schema.Types.ObjectId },
  },
  metadata:  { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
