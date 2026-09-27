import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Fallback to direct backend URL if proxy fails or in standalone mode
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ERR_NETWORK' && !client.defaults.baseURL.startsWith('http')) {
      client.defaults.baseURL = 'http://localhost:8000';
      error.config.baseURL = 'http://localhost:8000';
      return client.request(error.config);
    }
    return Promise.reject(error);
  }
);

export const healthCheck = async () => {
  const res = await client.get('/health');
  return res.data;
};

export const ingestProject = async (path) => {
  const res = await client.post('/ingest', { path });
  return res.data;
};

export const fetchGraph = async (projectId) => {
  const res = await client.get(`/graph`, {
    params: { project_id: projectId },
  });
  return res.data;
};

export const fetchImpact = async (functionId, projectId) => {
  const res = await client.get(`/impact/${functionId}`, {
    params: { project_id: projectId },
  });
  return res.data;
};

export default client;
