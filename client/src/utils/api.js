import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let _onUnauthorized = null;

export function setOnUnauthorized(cb) {
  _onUnauthorized = cb;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) _onUnauthorized?.();
    return Promise.reject(err);
  }
);

export default api;
