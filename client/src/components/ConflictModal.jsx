export default function ConflictModal({ isOpen, latest, onRefresh, onForceOverwrite, onClose }) {
  if (!isOpen || !latest) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-gray-900 font-semibold text-lg mb-3">⚠ Version Conflict</h3>
        <p className="text-gray-600 text-sm mb-4">
          Someone else updated this task.
        </p>

        <div className="border border-gray-200 rounded-md p-3 mb-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            Latest version: <span className="font-medium text-gray-900">v{latest.versionNumber}</span>
          </p>
          <p className="text-sm text-gray-600">
            Title: <span className="font-medium text-gray-900">{latest.title}</span>
          </p>
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium text-gray-900">{latest.status}</span>
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => { onRefresh(latest); onClose(); }}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm cursor-pointer transition-colors"
          >
            Refresh My View
          </button>
          <button
            onClick={() => { onForceOverwrite(latest.versionNumber); onClose(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
          >
            Force Save
          </button>
        </div>
      </div>
    </div>
  );
}
