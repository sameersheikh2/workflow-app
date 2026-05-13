const mongoose = require('mongoose');

const WebhookDeliverySchema = new mongoose.Schema({
  projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  webhookUrl:   { type: String },
  taskId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  status:       { type: String, enum: ['success', 'failed'] },
  attempts:     { type: Number, default: 0 },
  responseCode: { type: Number },
  sentAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('WebhookDelivery', WebhookDeliverySchema);
