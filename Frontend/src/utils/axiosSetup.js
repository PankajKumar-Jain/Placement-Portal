import axios from 'axios';
import { redirect } from 'react-router-dom';

const APIUrl = import.meta.env.VITE_API_URL;

export const customFetch = axios.create({
  baseURL: APIUrl,
  withCredentials: true,
});

customFetch.interceptors.response.use(function (response) {
  if (response.status === 401 || response.status === 403) {
    return redirect(window.location.origin);
  }
  return response;
});
