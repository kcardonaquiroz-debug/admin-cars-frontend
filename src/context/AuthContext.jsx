import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('usuario')
    if (stored) {
      setUsuario(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    sessionStorage.removeItem('alertas_avisadas') // mostrar el aviso de vencimientos al entrar
    setUsuario(data.usuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)