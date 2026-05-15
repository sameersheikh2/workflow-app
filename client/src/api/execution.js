import api from './axios';

export async function computeExecution(projectId) {
  const res = await api.post(`/projects/${projectId}/compute-execution`);
  return res.data.data;
}

export async function simulate(projectId, availableHours, failedTaskIds) {
  const res = await api.post(`/projects/${projectId}/simulate`, {
    availableHours,
    failedTaskIds,
  });
  return res.data.data;
}
