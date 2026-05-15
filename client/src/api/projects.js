import api from './axios';

export async function getProjects() {
  const res = await api.get('/projects');
  return res.data.data;
}

export async function createProject(name, description) {
  const res = await api.post('/projects', { name, description });
  return res.data.data;
}

export async function getProject(projectId) {
  const res = await api.get(`/projects/${projectId}`);
  return res.data.data;
}

export async function generateInvite(projectId) {
  const res = await api.post(`/projects/${projectId}/invite`);
  return res.data.data;
}

export async function joinProject(token) {
  const res = await api.post('/projects/join', { token });
  return res.data.data;
}

export async function getAuditLog(projectId) {
  const res = await api.get(`/projects/${projectId}/audit`);
  return res.data.data;
}
