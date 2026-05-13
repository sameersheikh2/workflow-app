const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role:   { type: String, enum: ['owner', 'member'], default: 'member' },
  }],
  inviteToken:       { type: String },
  inviteTokenExpiry: { type: Date },
  webhookUrl:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
