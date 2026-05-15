import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProject } from '../api/projects';
import { getTasks } from '../api/tasks';
import useSocket from '../hooks/useSocket';

const ProjectContext = createContext(null);

export function ProjectProvider({ projectId, children }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const mergeTask = useCallback((updatedTask) => {
    if (!updatedTask || !updatedTask._id) return;
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t._id === updatedTask._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedTask;
        return copy;
      }
      return [...prev, updatedTask];
    });
  }, []);

  const patchTask = useCallback((taskId, fields) => {
    if (!taskId) return;
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t._id === taskId);
      if (idx < 0) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...fields };
      return copy;
    });
  }, []);

  const removeTask = useCallback((taskId) => {
    if (!taskId) return;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }, []);

  useSocket(projectId, mergeTask, patchTask, removeTask);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [proj, taskList] = await Promise.all([
          getProject(projectId),
          getTasks(projectId),
        ]);
        setProject(proj);
        setTasks(taskList);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  return (
    <ProjectContext.Provider value={{ project, tasks, setTasks, mergeTask, removeTask, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be inside ProjectProvider');
  return ctx;
}
