import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Set default theme — overridden by ThemeToggle in App
const saved = localStorage.getItem('eyay-theme') as 'dark' | 'light' | null;
document.documentElement.dataset.theme = saved ?? 'dark';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
