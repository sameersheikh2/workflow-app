import api from './axios';

export async function getTasks(projectId) {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data.data;
}

export async function createTask(projectId, data) {
  const res = await api.post(`/projects/${projectId}/tasks`, data);
  return res.data.data;
}

export async function getTask(projectId, taskId) {
  const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
  return res.data.data;
}

export async function updateTask(projectId, taskId, data) {
  const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, data);
  return res.data.data;
}

export async function deleteTask(projectId, taskId) {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}

export async function getTaskHistory(projectId, taskId) {
  const res = await api.get(`/projects/${projectId}/tasks/${taskId}/history`);
  return res.data.data;
}

export async function retryTask(projectId, taskId) {
  const res = await api.post(`/projects/${projectId}/tasks/${taskId}/retry`);
  return res.data.data;
}
