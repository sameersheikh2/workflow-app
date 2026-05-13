function taskSorter(a, b) {
  if (b.priority !== a.priority) return b.priority - a.priority;
  if (a.estimatedHours !== b.estimatedHours) return a.estimatedHours - b.estimatedHours;
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function topoSort(tasks) {
  const taskMap = {};
  const inDegree = {};
  const adj = {};

  for (const task of tasks) {
    const id = task._id.toString();
    taskMap[id] = task;
    inDegree[id] = 0;
    adj[id] = [];
  }

  for (const task of tasks) {
    const id = task._id.toString();
    for (const dep of task.dependencies) {
      const depId = dep.toString();
      if (!taskMap[depId]) continue;
      adj[depId] = adj[depId] || [];
      adj[depId].push(id);
      inDegree[id] = (inDegree[id] || 0) + 1;
    }
  }

  const queue = tasks
    .filter(t => (inDegree[t._id.toString()] || 0) === 0)
    .sort(taskSorter);

  const result = [];

  while (queue.length) {
    const task = queue.shift();
    result.push(task);
    const id = task._id.toString();
    for (const neighbor of (adj[id] || [])) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(taskMap[neighbor]);
        queue.sort(taskSorter);
      }
    }
  }

  return result;
}

module.exports = { topoSort };
