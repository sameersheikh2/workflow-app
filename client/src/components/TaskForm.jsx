import { useState } from 'react';
import { createTask, updateTask } from '../api/tasks';
import DepsSelector from './DepsSelector';
import ConflictModal from './ConflictModal';
import Loader from './Loader';

export default function TaskForm({ projectId, allTasks, initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState(initialData?.priority || 3);
  const [estimatedHours, setEstimatedHours] = useState(initialData?.estimatedHours || '');
  const [resourceTag, setResourceTag] = useState(initialData?.resourceTag || '');
  const [maxRetries, setMaxRetries] = useState(initialData?.maxRetries ?? 3);
  const [dependencies, setDependencies] = useState(initialData?.dependencies || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(null);

  async function handleSubmit(e, overrideVersion) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        title, description, priority: Number(priority),
        estimatedHours: Number(estimatedHours), resourceTag, maxRetries: Number(maxRetries),
        dependencies,
      };
      let result;
      if (isEdit) {
        data.versionNumber = overrideVersion || initialData.versionNumber;
        result = await updateTask(projectId, initialData._id, data);
      } else {
        result = await createTask(projectId, data);
      }
      onSuccess(result);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict(err.response.data.latest);
      } else {
        setError(err.response?.data?.error || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh(latest) {
    setTitle(latest.title);
    setDescription(latest.description || '');
    setPriority(latest.priority);
    setEstimatedHours(latest.estimatedHours);
    setResourceTag(latest.resourceTag || '');
    setMaxRetries(latest.maxRetries);
    setDependencies(latest.dependencies || []);
  }

  function handleForceOverwrite(version) {
    handleSubmit(null, version);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm">
      <h4 className="text-gray-900 font-medium text-sm mb-3">{isEdit ? 'Edit Task' : 'New Task'}</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[1,2,3,4,5].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours *</label>
            <input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)}
              min="0.5" step="0.5" required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Tag</label>
            <input type="text" value={resourceTag} onChange={(e) => setResourceTag(e.target.value)}
              placeholder="e.g. gpu, db, api"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Retries</label>
            <input type="number" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)}
              min="0"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <DepsSelector allTasks={allTasks} selectedDeps={dependencies}
          onChange={setDependencies} currentTaskId={initialData?._id} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
          {loading && <Loader size="sm" />}
          {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm cursor-pointer transition-colors">
          Cancel
        </button>
      </div>
      <ConflictModal isOpen={!!conflict} latest={conflict}
        onRefresh={handleRefresh} onForceOverwrite={handleForceOverwrite}
        onClose={() => setConflict(null)} />
    </form>
  );
}
