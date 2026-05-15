const Task = require('../models/Task');
const { topoSort } = require('../utils/topoSort');
const { decryptTask } = require('../utils/decryptTask');
const { STATUS } = require('../utils/constants');

async function computeExecutionPlan(projectId) {
  const tasks = await Task.find({ projectId });

  const blockedTasks = [];
  const eligibleTasks = [];

  for (const task of tasks) {
    if (task.status === STATUS.COMPLETED) continue;

    if (task.status === STATUS.BLOCKED) {
      blockedTasks.push({ task: decryptTask(task), reason: 'Explicitly blocked' });
      continue;
    }

    if (task.status === STATUS.FAILED && task.retryCount >= task.maxRetries) {
      blockedTasks.push({ task: decryptTask(task), reason: 'Max retries exceeded' });
      continue;
    }

    eligibleTasks.push(task);
  }

  const sorted = topoSort(eligibleTasks);
  const executionOrder = sorted.map(decryptTask);

  return { executionOrder, blockedTasks };
}

module.exports = { computeExecutionPlan };
