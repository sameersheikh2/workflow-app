import { useState } from 'react';
import { simulate } from '../api/execution';
import Loader from './Loader';

export default function SimulationTab({ projectId, tasks }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [availableHours, setAvailableHours] = useState('');
  const [failedIds, setFailedIds] = useState([]);

  async function handleSimulate() {
    setLoading(true);
    setError('');
    setSimResult(null);
    try {
      const result = await simulate(projectId, Number(availableHours), failedIds);
      setSimResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  function toggleFailed(taskId) {
    setFailedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Hours</label>
          <input type="number" value={availableHours} onChange={(e) => setAvailableHours(e.target.value)}
            min="0" step="0.5"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={handleSimulate} disabled={loading || !availableHours}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
          {loading && <Loader size="sm" />} Run Simulation
        </button>
      </div>
      {tasks.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mark as failed (optional):</label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
            {tasks.map((t) => (
              <label key={t._id} className="flex items-center gap-2 py-1 px-1 text-sm cursor-pointer hover:bg-gray-50 rounded">
                <input type="checkbox" checked={failedIds.includes(t._id)}
                  onChange={() => toggleFailed(t._id)} className="rounded border-gray-300 cursor-pointer" />
                <span className="text-gray-700">{t.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {simResult && (
        <div className="space-y-3 bg-gray-50 rounded-md p-4">
          {simResult.selectedTasks?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-1">✅ Selected (fits budget):</h4>
              <ul className="space-y-1">
                {simResult.selectedTasks.map((t) => (
                  <li key={t._id} className="text-sm text-gray-700">{t.title}  {t.estimatedHours}h  P{t.priority}</li>
                ))}
              </ul>
            </div>
          )}
          {simResult.skippedTasks?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-700 mb-1">⏭ Skipped (no budget):</h4>
              <ul className="space-y-1">
                {simResult.skippedTasks.map((t) => (
                  <li key={t._id} className="text-sm text-gray-700">{t.title}  {t.estimatedHours}h</li>
                ))}
              </ul>
            </div>
          )}
          {simResult.blockedTasks?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-1">⛔ Blocked:</h4>
              <ul className="space-y-1">
                {simResult.blockedTasks.map((entry, i) => (
                  <li key={entry.task?._id || i} className="text-sm text-gray-700">
                    {entry.task?.title || entry} — {entry.reason || 'Blocked'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-gray-600 border-t border-gray-200 pt-2">
            Total: {simResult.hoursUsed ?? 0}h used / {availableHours}h budget
            {simResult.totalPriorityScore != null && ` | Priority score: ${simResult.totalPriorityScore}`}
          </p>
        </div>
      )}
    </div>
  );
}
