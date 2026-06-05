import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Перехватчик для добавления JWT-токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Проекты
export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (name, xml_content) => api.post('/projects/', { name, xml_content }),
  update: (id, xml_content) => api.put(`/projects/${id}`, { xml_content }),
  delete: (id) => api.delete(`/projects/${id}`),
}

// Шаблоны
export const templatesAPI = {
  getAll: () => api.get('/templates/'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (name, xml_content) => api.post('/templates/', { name, xml_content }),
  delete: (id) => api.delete(`/templates/${id}`),
}

// Аутентификация
export const authAPI = {
  register: (username, password) => api.post('/auth/register', { username, password }),
  login: (username, password) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
}