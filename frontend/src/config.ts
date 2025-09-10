// Determine API URL based on current hostname
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api'
  : `https://${window.location.hostname}/api`;

console.log('Current API URL:', API_URL); // For debugging

export { API_URL };

export default {
  API_URL,
};
