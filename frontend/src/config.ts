const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment 
  ? 'http://localhost:8000/api'
  : 'https://pingtech.pythonanywhere.com/api';

export default {
  API_URL,
};
