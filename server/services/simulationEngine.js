const { computeExecutionPlan } = require('./executionEngine');

async function simulate(projectId, availableHours, failedTaskIds = []) {
  let { executionOrder, blockedTasks } = await computeExecutionPlan(projectId);

  const failedSet = new Set(failedTaskIds.map(String));
  const additionalBlocked = [];

  executionOrder = executionOrder.filter(task => {
    if (failedSet.has(task._id.toString())) {
      additionalBlocked.push({ task, reason: 'Marked as failed in simulation' });
      return false;
    }

    const depFailed = task.dependencies.some(d => failedSet.has(d.toString()));
    if (depFailed) {
      failedSet.add(task._id.toString());
      additionalBlocked.push({ task, reason: 'Dependency failed' });
      return false;
    }

    return true;
  });

  blockedTasks = [...blockedTasks, ...additionalBlocked];

  const selectedTasks = [];
  const skippedTasks = [];
  let hoursUsed = 0;
  let totalPriorityScore = 0;

  for (const task of executionOrder) {
    if (hoursUsed + task.estimatedHours <= availableHours) {
      selectedTasks.push(task);
      hoursUsed += task.estimatedHours;
      totalPriorityScore += task.priority;
    } else {
      skippedTasks.push(task);
    }
  }

  return {
    executionOrder,
    selectedTasks,
    blockedTasks,
    skippedTasks,
    totalPriorityScore,
    hoursUsed,
  };
}

module.exports = { simulate };
