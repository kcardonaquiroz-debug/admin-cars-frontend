import { useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'https://admin-cars-backend.onrender.com/api'

export default function useKeepAlive(interval = 4 * 60 * 1000) {
  useEffect(() => {
    const ping = () => {
      axios.get(`${API_BASE}/health`).catch(() => {})
    }
    ping()
    const id = setInterval(ping, interval)
    return () => clearInterval(id)
  }, [interval])
}
