import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, joinProject } from '../api/projects';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const project = await createProject(newName, newDesc);
      setProjects([...projects, project]);
      setShowNew(false);
      setNewName('');
      setNewDesc('');
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const project = await joinProject(joinToken);
      setProjects([...projects, project]);
      setShowJoin(false);
      setJoinToken('');
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to join project');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-20 sm:pt-22 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900 text-xl sm:text-2xl font-bold">My Projects</h1>
          <button onClick={() => { setShowNew(!showNew); setShowJoin(false); setFormError(''); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
            + New Project
          </button>
        </div>

        {showNew && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm mb-6">
            <h3 className="text-gray-900 font-medium text-sm mb-3">Create New Project</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Project name" value={newName}
                onChange={(e) => setNewName(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Description (optional)" value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {formLoading ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowNew(false)}
                  className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm cursor-pointer transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {loading && <Loader />}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-1">No projects yet</p>
            <p className="text-gray-300 text-xs">Create one or join with an invite token</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {projects.map((p) => (
              <div key={p._id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/project/${p._id}`)}>
                <h3 className="text-gray-900 font-medium text-sm mb-1">{p.name}</h3>
                {p.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{p.description}</p>}
                <span className="text-blue-600 text-xs font-medium hover:underline">Open Project →</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <button onClick={() => { setShowJoin(!showJoin); setShowNew(false); setFormError(''); }}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm cursor-pointer transition-colors">
            Join with Invite Token
          </button>
          {showJoin && (
            <form onSubmit={handleJoin} className="mt-3 flex flex-col sm:flex-row gap-2">
              <input type="text" placeholder="Paste invite token" value={joinToken}
                onChange={(e) => setJoinToken(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={formLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Join
              </button>
            </form>
          )}
          {showJoin && formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
        </div>
      </div>
    </div>
  );
}
