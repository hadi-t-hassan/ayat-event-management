import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

// Set initial direction based on saved language
const savedLanguage = localStorage.getItem('language') || 'ar';
document.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)