import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectProvider, useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import ExecutionPanel from '../components/ExecutionPanel';
import InviteModal from '../components/InviteModal';
import WebhookModal from '../components/WebhookModal';

function ProjectContent() {
  const { project, tasks, mergeTask, loading, error } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  if (loading) return <Loader />;
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-500 text-sm mb-3">{error}</p>
      <button onClick={() => window.location.reload()}
        className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm cursor-pointer transition-colors">
        Retry
      </button>
    </div>
  );

  const isOwner = project?.owner === user?.id;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer transition-colors">← Back</button>
          <h1 className="text-gray-900 text-xl sm:text-2xl font-bold">{project?.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInvite(true)}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm cursor-pointer transition-colors">
            Invite Members
          </button>
          {isOwner && (
            <button onClick={() => setShowWebhook(true)}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm cursor-pointer transition-colors">
              ⚙ Webhook
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-gray-900 font-semibold text-base mb-3">Project Members</h2>
        <div className="flex flex-wrap gap-3">
          {project?.members?.map((member, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {member.userId?.name ? member.userId.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium leading-tight">{member.userId?.name || 'Unknown'}</span>
                <span className="text-gray-500 text-xs leading-tight capitalize">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-semibold text-base">Tasks</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
            {showForm ? 'Close' : '+ Add Task'}
          </button>
        </div>

        {showForm && (
          <div className="mb-4">
            <TaskForm projectId={project._id} allTasks={tasks}
              onSuccess={(task) => { mergeTask(task); setShowForm(false); }}
              onCancel={() => setShowForm(false)} />
          </div>
        )}

        {tasks.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-400 text-sm">No tasks yet — add one to get started</p>
          </div>
        )}

        <div className="space-y-3">
          {tasks.filter((t) => t._id).map((task) => (
            <TaskCard key={task._id} task={task} projectId={project._id}
              allTasks={tasks} onUpdate={mergeTask} />
          ))}
        </div>
      </div>

      <ExecutionPanel projectId={project._id} tasks={tasks} />

      <InviteModal projectId={project?._id} isOpen={showInvite}
        onClose={() => setShowInvite(false)} />
      <WebhookModal projectId={project?._id} isOpen={showWebhook}
        onClose={() => setShowWebhook(false)} />
    </div>
  );
}

export default function Project() {
  const { id } = useParams();
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-20 sm:pt-22 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ProjectProvider projectId={id}>
          <ProjectContent />
        </ProjectProvider>
      </div>
    </div>
  );
}
