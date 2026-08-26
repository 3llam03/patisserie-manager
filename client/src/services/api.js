const BASE = 'http://localhost:5000/api';

const req = (method, path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(data ? { body: JSON.stringify(data) } : {})
  }).then(r => r.json()).then(data => ({ data }));
};

export const login = (data) => req('POST', '/auth/login', data);
export const registerUser = (data) => req('POST', '/auth/register', data);
export const getUsers = () => req('GET', '/auth/users');

export const getRecipes = () => req('GET', '/recipes');
export const getRecipe = (id) => req('GET', `/recipes/${id}`);
export const createRecipe = (data) => req('POST', '/recipes', data);
export const updateRecipe = (id, data) => req('PUT', `/recipes/${id}`, data);
export const updateIngredients = (id, ingredients) => req('PUT', `/recipes/${id}/ingredients`, { ingredients });
export const deleteRecipe = (id) => req('DELETE', `/recipes/${id}`);

export const getTasks = () => req('GET', '/tasks');
export const getTodayTasks = () => req('GET', '/tasks/today');
export const createTask = (data) => req('POST', '/tasks', data);
export const updateTaskStatus = (id, status) => req('PATCH', `/tasks/${id}/status`, { status });
export const deleteTask = (id) => req('DELETE', `/tasks/${id}`);
