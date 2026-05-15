import { useState } from 'react';
import { generateInvite } from '../api/projects';
import Loader from './Loader';

export default function InviteModal({ projectId, isOpen, onClose }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const data = await generateInvite(projectId);
      setToken(data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate invite');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-gray-900 font-semibold text-lg mb-3">Invite Members</h3>
        {!token ? (
          <div>
            <p className="text-gray-600 text-sm mb-4">Generate an invite token to share with team members.</p>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button onClick={handleGenerate} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader size="sm" />} Generate Token
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 text-sm mb-2">Share this token — expires in 30 minutes</p>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-700 break-all mb-3">
              {token}
            </div>
            <button onClick={handleCopy}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm">
              {copied ? 'Copied!' : 'Copy Token'}
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={() => { onClose(); setToken(''); }}
            className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
