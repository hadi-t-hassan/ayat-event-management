const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:8000/api'
    : 'https://pingtech.pythonanywhere.com/api'
);

console.log('Current API URL:', API_URL); // For debugging

export { API_URL };

export default {
  API_URL,
};
