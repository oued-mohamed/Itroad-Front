// src/services/api.ts
import { API_CONFIG } from '../utils/constants';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});