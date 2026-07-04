// src/shared/api/userClient.js
import axios from 'axios';
import ENDPOINTS from '../constants/endpoints.js';
import { attachAuthInterceptors } from './authClient.js';

export const userClient = axios.create({
  baseURL: ENDPOINTS.USER,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(userClient);

export default userClient;
