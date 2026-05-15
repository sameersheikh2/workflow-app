import api from './axios';

export async function signup(name, email, password) {
  const res = await api.post('/auth/signup', { name, email, password });
  return res.data.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data;
}
