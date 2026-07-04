// src/shared/api/accountClient.js
import axios from 'axios';
import ENDPOINTS from '../constants/endpoints.js';
import { attachAuthInterceptors } from './authClient.js';

export const accountClient = axios.create({
  baseURL: ENDPOINTS.USER,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(accountClient);

export default accountClient;
