const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

console.log('Current API URL:', API_URL); // For debugging

export { API_URL };

export default {
  API_URL,
};
