const Task = require('../models/Task');
const { topoSort } = require('../utils/topoSort');
const { decrypt } = require('../utils/encrypt');

async function computeExecutionPlan(projectId) {
  const tasks = await Task.find({ projectId });

  const blockedTasks = [];
  const eligibleTasks = [];

  for (const task of tasks) {
    if (task.status === 'Completed') continue;

    if (task.status === 'Blocked') {
      blockedTasks.push({ task, reason: 'Explicitly blocked' });
      continue;
    }

    if (task.status === 'Failed' && task.retryCount >= task.maxRetries) {
      blockedTasks.push({ task, reason: 'Max retries exceeded' });
      continue;
    }

    eligibleTasks.push(task);
  }

  const executionOrder = topoSort(eligibleTasks);

  for (const task of executionOrder) {
    task.description = decrypt(task.description);
  }
  for (const item of blockedTasks) {
    item.task.description = decrypt(item.task.description);
  }

  return { executionOrder, blockedTasks };
}

module.exports = { computeExecutionPlan };
