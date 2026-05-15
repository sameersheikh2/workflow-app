const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const { getMemberProject } = require('../utils/memberGuard');
const { hasCycle } = require('../utils/cycleDetect');
const { encrypt } = require('../utils/encrypt');
const { decryptTask } = require('../utils/decryptTask');
const { auditLog } = require('../services/auditLogger');
const { STATUS } = require('../utils/constants');

router.use(authGuard);

router.get('/:projectId/tasks', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const tasks = await Task.find({ projectId: req.params.projectId });
    const decrypted = tasks.map(decryptTask);
    res.json({ success: true, data: decrypted });
  } catch (err) {
    next(err);
  }
});

router.post('/:projectId/tasks', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const { title, description, priority, estimatedHours, dependencies, resourceTag, maxRetries } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    if (estimatedHours == null || estimatedHours <= 0) {
      return res.status(400).json({ success: false, error: 'estimatedHours must be greater than 0' });
    }
    if (priority !== undefined && (priority < 1 || priority > 5)) {
      return res.status(400).json({ success: false, error: 'Priority must be between 1 and 5' });
    }

    const allTasks = await Task.find({ projectId: req.params.projectId });
    const mongoose = require('mongoose');
    const tempId = new mongoose.Types.ObjectId();

    if (dependencies && dependencies.length > 0) {
      if (hasCycle(tempId, dependencies, allTasks)) {
        auditLog(req.user.userId, 'dependency.rejected', 'Task', tempId);
        return res.status(400).json({ success: false, error: 'Cyclic dependency detected' });
      }
    }

    const task = await Task.create({
      projectId: req.params.projectId,
      title: title.trim(),
      description: encrypt(description),
      priority,
      estimatedHours,
      dependencies: dependencies || [],
      resourceTag,
      maxRetries,
      createdBy: req.user.userId,
    });

    auditLog(req.user.userId, 'task.created', 'Task', task._id);

    const io = req.app.get('io');
    if (io) io.to(`project:${req.params.projectId}`).emit('task:created', { task: decryptTask(task) });

    res.status(201).json({ success: true, data: decryptTask(task) });
  } catch (err) {
    next(err);
  }
});

router.get('/:projectId/tasks/:taskId', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const task = await Task.findOne({ _id: req.params.taskId, projectId: req.params.projectId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: decryptTask(task) });
  } catch (err) {
    next(err);
  }
});

router.get('/:projectId/tasks/:taskId/history', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const history = await TaskHistory.find({ taskId: req.params.taskId }).sort({ version: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

router.delete('/:projectId/tasks/:taskId', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, projectId: req.params.projectId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const io = req.app.get('io');
    if (io) io.to(`project:${req.params.projectId}`).emit('task:deleted', { taskId: req.params.taskId });

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
