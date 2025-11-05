import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Use Vite's base URL so routing works when the app is served from a
// sub-path (e.g. GitHub Pages at /hyrule-api/). In dev this will be '/'.
const basename = import.meta.env.BASE_URL || '/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
