import Constants from "expo-constants";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
const { manifest } = Constants;

{/*
const isDev = (typeof manifest.packagerOpts === 'object') && manifest.packagerOpts.dev;

const apiHost = isDev
  ? manifest.debuggerHost.split(':').shift().concat(':3000') // "192.168.1.10:3000"
  : 'api.spendify.hk';

const apiBaseUrl = isDev ? `http://${apiHost}` : `https://${apiHost}`;

export default apiBaseUrl;

*/}




export const API_CONFIG = {
  getBaseUrl: (): string => {
    const apiBaseUrl = `http://192.168.50.14:8080`; //`https://api.spendify.hk`;
    return apiBaseUrl;
  },
  
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
    },
    categories: '/categories',
    transactions: '/transactions',
    ocr: '/ocr/process',
    analytics: {
      summary: '/analytics/summary',
      daily: '/analytics/daily',
    },

  },
  
 getHeaders: async (): Promise<Record<string, string>> => {
    const token = await SecureStore.getItemAsync('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },
} as const;

export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.getBaseUrl()}${endpoint}`;
};

export const createAuthenticatedApiClient = async () => {
  const headers = await API_CONFIG.getHeaders();
  
  return axios.create({
    baseURL: API_CONFIG.getBaseUrl(),
    timeout: 10000,
    headers,
  });
};

export const makeAuthenticatedRequest = async <T,>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: any
): Promise<T> => {
  const headers = await API_CONFIG.getHeaders();
  const url = getFullUrl(endpoint);
  
  const response = await axios({
    method,
    url,
    data,
    headers,
  });
  
  return response.data;
};

{/* 
export const apiClient = axios.create({
  baseURL: API_CONFIG.getBaseUrl(),
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});
*/}