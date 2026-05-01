import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0d1526',
          color: '#e2e8f0',
          border: '1px solid rgba(255,215,0,0.2)',
          fontFamily: 'Inter, sans-serif',
        },
        success: { iconTheme: { primary: '#FFD700', secondary: '#0a0f1e' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)
