const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const { getMemberProject } = require('../utils/memberGuard');
const { hasCycle } = require('../utils/cycleDetect');
const { encrypt, decrypt } = require('../utils/encrypt');
const { auditLog } = require('../services/auditLogger');
const webhookService = require('../services/webhookService');

router.use(authGuard);

function decryptTask(task) {
  const obj = task.toObject ? task.toObject() : { ...task };
  obj.description = decrypt(obj.description);
  return obj;
}

router.put('/:projectId/tasks/:taskId', async (req, res, next) => {
  try {
    const project = await getMemberProject(req.params.projectId, req.user.userId);
    const { versionNumber, ...updateFields } = req.body;

    if (versionNumber == null) {
      return res.status(400).json({ success: false, error: 'versionNumber is required' });
    }

    const task = await Task.findOne({
      _id: req.params.taskId,
      projectId: req.params.projectId,
      versionNumber,
    });

    if (!task) {
      const latest = await Task.findById(req.params.taskId);
      return res.status(409).json({
        success: false,
        error: 'Version conflict. Someone else updated this task.',
        latest: latest ? decryptTask(latest) : null,
      });
    }

    if (updateFields.dependencies) {
      const allTasks = await Task.find({ projectId: req.params.projectId });
      if (hasCycle(task._id, updateFields.dependencies, allTasks)) {
        auditLog(req.user.userId, 'dependency.rejected', 'Task', task._id);
        return res.status(400).json({ success: false, error: 'Cyclic dependency detected' });
      }
    }

    const oldStatus = task.status;
    const newStatus = updateFields.status;

    if (newStatus === 'Running') {
      const deps = await Task.find({ _id: { $in: task.dependencies } });
      const allDepsCompleted = deps.every(d => d.status === 'Completed');
      if (!allDepsCompleted) {
        return res.status(400).json({ success: false, error: 'Not all dependencies are completed' });
      }
      if (task.resourceTag) {
        const conflict = await Task.findOne({
          projectId: task.projectId,
          status: 'Running',
          resourceTag: task.resourceTag,
          _id: { $ne: task._id },
        });
        if (conflict) {
          return res.status(400).json({
            success: false,
            error: `Resource '${task.resourceTag}' is in use by another running task`,
          });
        }
      }
    }

    if (updateFields.description !== undefined) {
      updateFields.description = encrypt(updateFields.description);
    }

    task.set(updateFields);
    task.versionNumber += 1;
    await task.save();

    await TaskHistory.create({
      taskId: task._id,
      version: task.versionNumber,
      snapshot: task.toObject(),
      changedBy: req.user.userId,
    });

    const io = req.app.get('io');
    const decrypted = decryptTask(task);

    if (newStatus && newStatus !== oldStatus) {
      auditLog(req.user.userId, 'task.status_changed', 'Task', task._id, { from: oldStatus, to: newStatus });
      if (io) io.to(`project:${req.params.projectId}`).emit('task:status', { taskId: task._id, status: newStatus, updatedBy: req.user.userId });

      if (newStatus === 'Completed' && project.webhookUrl) {
        webhookService.fire(project._id, project.webhookUrl, task).catch(console.error);
      }

      if (newStatus === 'Failed' && task.retryCount >= task.maxRetries) {
        const dependents = await Task.find({ projectId: req.params.projectId, dependencies: task._id });
        for (const dep of dependents) {
          dep.status = 'Blocked';
          await dep.save();
        }
        auditLog(req.user.userId, 'task.failed', 'Task', task._id);
      }
    } else {
      auditLog(req.user.userId, 'task.updated', 'Task', task._id);
    }

    if (io && !(newStatus && newStatus !== oldStatus)) {
      io.to(`project:${req.params.projectId}`).emit('task:updated', { task: decrypted });
    }

    res.json({ success: true, data: decrypted });
  } catch (err) {
    next(err);
  }
});

router.post('/:projectId/tasks/:taskId/retry', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const task = await Task.findOne({ _id: req.params.taskId, projectId: req.params.projectId });

    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.retryCount >= task.maxRetries) {
      return res.status(400).json({ success: false, error: 'Max retries exceeded' });
    }

    task.retryCount += 1;
    task.status = 'Pending';
    await task.save();

    auditLog(req.user.userId, 'task.retried', 'Task', task._id);

    const io = req.app.get('io');
    if (io) io.to(`project:${req.params.projectId}`).emit('task:retried', { taskId: task._id, retryCount: task.retryCount });

    res.json({ success: true, data: decryptTask(task) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
