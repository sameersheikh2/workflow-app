import api from './axios';

export async function signup(name, email, password) {
  const res = await api.post('/auth/signup', { name, email, password });
  return res.data.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}
