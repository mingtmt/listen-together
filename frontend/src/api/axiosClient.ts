import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Interceptor for Request
axiosClient.interceptors.request.use(
  (config) => {
    // TODO: For authentication
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for Response
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error('Request failed:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

export default axiosClient;