function taskSorter(a, b) {
  if (b.priority !== a.priority) return b.priority - a.priority;
  if (a.estimatedHours !== b.estimatedHours) return a.estimatedHours - b.estimatedHours;
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function insertSorted(queue, task) {
  let lo = 0, hi = queue.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (taskSorter(task, queue[mid]) < 0) hi = mid;
    else lo = mid + 1;
  }
  queue.splice(lo, 0, task);
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
      adj[depId].push(id);
      inDegree[id] += 1;
    }
  }

  const queue = tasks
    .filter(t => inDegree[t._id.toString()] === 0)
    .sort(taskSorter);

  const result = [];

  while (queue.length) {
    const task = queue.shift();
    result.push(task);
    const id = task._id.toString();
    for (const neighbor of adj[id]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        insertSorted(queue, taskMap[neighbor]);
      }
    }
  }

  return result;
}

module.exports = { topoSort };
