import { useState, useEffect } from 'react';
import { updateTask, deleteTask } from '../api/tasks';
import PriorityBadge from './PriorityBadge';
import TaskForm from './TaskForm';
import ConflictModal from './ConflictModal';
import { STATUS_COLORS } from '../utils/statusColors';

const STATUSES = ['Pending', 'Running', 'Completed', 'Failed', 'Blocked'];

export default function TaskCard({ task, projectId, allTasks, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(t);
  }, [error]);

  async function handleStatusChange(e) {
    setError('');
    try {
      const result = await updateTask(projectId, task._id, {
        status: e.target.value,
        versionNumber: task.versionNumber,
      });
      onUpdate(result);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict(err.response.data.latest);
      } else {
        setError(err.response?.data?.error || 'Update failed');
      }
    }
  }

  async function handleDelete() {
    setError('');
    try {
      await deleteTask(projectId, task._id);
      setConfirmDelete(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  }

  function handleEditSuccess(updated) {
    onUpdate(updated);
    setEditing(false);
  }

  const statusColor = STATUS_COLORS[task.status] || '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <span className="text-gray-900 font-medium text-sm">{task.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>{task.status}</span>
        </div>
        <select value={task.status} onChange={handleStatusChange}
          className="border border-gray-300 rounded-md px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white self-start sm:self-auto">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500 mb-3">
        <span>⏱ {task.estimatedHours}h</span>
        {task.resourceTag && <span>🏷 {task.resourceTag}</span>}
        <span>🔗 Deps: {task.dependencies?.length || 0}</span>
        <span className="text-gray-400">v{task.versionNumber}</span>
        <span className="text-gray-400">Retries: {task.retryCount}/{task.maxRetries}</span>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => setEditing(!editing)}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors">
          {editing ? 'Close' : 'Edit'}
        </button>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors">
            Delete
          </button>
        ) : (
          <div className="flex gap-1.5 items-center">
            <span className="text-xs text-gray-500">Delete?</span>
            <button onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors">
              Yes
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors">
              No
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {editing && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <TaskForm projectId={projectId} allTasks={allTasks}
            initialData={task} onSuccess={handleEditSuccess}
            onCancel={() => setEditing(false)} />
        </div>
      )}

      <ConflictModal isOpen={!!conflict} latest={conflict}
        onRefresh={(latest) => { onUpdate(latest); setConflict(null); }}
        onForceOverwrite={async (version) => {
          try {
            const result = await updateTask(projectId, task._id, {
              status: task.status, versionNumber: version,
            });
            onUpdate(result);
          } catch (err) {
            setError(err.response?.data?.error || 'Force update failed');
          }
        }}
        onClose={() => setConflict(null)} />
    </div>
  );
}
