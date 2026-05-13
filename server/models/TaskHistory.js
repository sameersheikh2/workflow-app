const mongoose = require('mongoose');

const TaskHistorySchema = new mongoose.Schema({
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  version:   { type: Number, required: true },
  snapshot:  { type: Object, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TaskHistory', TaskHistorySchema);
