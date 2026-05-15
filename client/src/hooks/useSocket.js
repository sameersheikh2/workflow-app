import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(projectId, mergeTask, patchTask, removeTask) {
  useEffect(() => {
    if (!projectId) return;

    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_SERVER_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      socket.emit('join:project', projectId);
    });

    // Full task object from backend
    socket.on('task:created', (data) => {
      if (data.task) mergeTask(data.task);
    });

    // Full task object from backend
    socket.on('task:updated', (data) => {
      if (data.task) mergeTask(data.task);
    });

    // Partial: { taskId, status, updatedBy } — patch existing task
    socket.on('task:status', (data) => {
      if (data.taskId) {
        patchTask(data.taskId, { status: data.status });
      }
    });

    // Partial: { taskId, retryCount } — patch existing task
    socket.on('task:retried', (data) => {
      if (data.taskId) {
        patchTask(data.taskId, { retryCount: data.retryCount, status: 'Pending' });
      }
    });

    socket.on('task:deleted', (data) => {
      if (data.taskId) removeTask(data.taskId);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, mergeTask, patchTask, removeTask]);
}
