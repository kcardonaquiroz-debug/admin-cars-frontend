import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import useKeepAlive from './hooks/useKeepAlive'
import App from './App.jsx'
import './index.css'

function Root() {
  useKeepAlive()
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)