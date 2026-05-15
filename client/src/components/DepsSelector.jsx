export default function DepsSelector({ allTasks, selectedDeps, onChange, currentTaskId }) {
  const eligible = allTasks.filter((t) => t._id !== currentTaskId);

  function wouldCauseCycle(task) {
    if (!currentTaskId) return false;
    return task.dependencies?.includes(currentTaskId);
  }

  function toggleDep(taskId) {
    if (selectedDeps.includes(taskId)) {
      onChange(selectedDeps.filter((id) => id !== taskId));
    } else {
      onChange([...selectedDeps, taskId]);
    }
  }

  if (eligible.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dependencies</label>
        <p className="text-gray-400 text-sm">No other tasks available</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Dependencies</label>
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
        {eligible.map((task) => {
          const cycle = wouldCauseCycle(task);
          return (
            <label
              key={task._id}
              className={`flex items-center gap-2 py-1 px-2 text-sm rounded hover:bg-gray-50 ${cycle ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedDeps.includes(task._id)}
                disabled={cycle}
                onChange={() => toggleDep(task._id)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-700">{task.title}</span>
              <span className="text-gray-400 text-xs">
                (P{task.priority}, {task.estimatedHours}h)
              </span>
              {cycle && <span className="text-red-500 text-xs">⚠️ cycle</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
