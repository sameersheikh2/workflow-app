import { useState } from 'react';
import { computeExecution } from '../api/execution';
import PriorityBadge from './PriorityBadge';
import Loader from './Loader';
import SimulationTab from './SimulationTab';

export default function ExecutionPanel({ projectId, tasks }) {
  const [tab, setTab] = useState('plan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [planResult, setPlanResult] = useState(null);

  async function handleComputePlan() {
    setLoading(true);
    setError('');
    setPlanResult(null);
    try {
      const result = await computeExecution(projectId);
      setPlanResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to compute plan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 className="text-gray-900 font-semibold text-base mb-4">Execution & Simulation</h3>
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('plan')}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${tab === 'plan' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          Execution Plan
        </button>
        <button onClick={() => setTab('sim')}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${tab === 'sim' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          Simulation
        </button>
      </div>

      {tab === 'plan' && (
        <div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button onClick={handleComputePlan} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mb-4 transition-colors">
            {loading && <Loader size="sm" />} Compute Plan
          </button>
          {planResult && (
            <div>
              {planResult.executionOrder?.length > 0 && (
                <>
                  <h4 className="text-gray-900 font-medium text-sm mb-2">Execution Order:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 mb-4">
                    {planResult.executionOrder.map((t, i) => (
                      <li key={t._id || i} className="text-sm text-gray-700">
                        {t.title || t}
                        {t.priority && <> <PriorityBadge priority={t.priority} /> <span className="text-gray-400">{t.estimatedHours}h</span></>}
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {planResult.blockedTasks?.length > 0 && (
                <>
                  <h4 className="text-gray-900 font-medium text-sm mb-2">Blocked:</h4>
                  <ul className="space-y-1.5">
                    {planResult.blockedTasks.map((entry, i) => (
                      <li key={entry.task?._id || i} className="text-sm text-gray-600">
                        • {entry.task?.title || entry} — {entry.reason || 'Blocked'}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'sim' && <SimulationTab projectId={projectId} tasks={tasks} />}
    </div>
  );
}
