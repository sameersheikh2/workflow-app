function hasCycle(proposedTaskId, proposedDeps, allTasks) {
  const graph = {};

  for (const task of allTasks) {
    graph[task._id.toString()] = task.dependencies.map(d => d.toString());
  }

  graph[proposedTaskId.toString()] = proposedDeps.map(d => d.toString());

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};

  function dfs(node) {
    color[node] = GRAY;
    for (const neighbor of (graph[node] || [])) {
      if (color[neighbor] === GRAY) return true;
      if (!color[neighbor] && dfs(neighbor)) return true;
    }
    color[node] = BLACK;
    return false;
  }

  for (const node of Object.keys(graph)) {
    if (!color[node] && dfs(node)) return true;
  }

  return false;
}

module.exports = { hasCycle };
