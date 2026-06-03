import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const getCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

const setCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: new Date().toISOString() }))
  } catch { }
}

export function useCRUD(endpoint) {
  const cacheKey = `snapshot_${endpoint}`
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/${endpoint}`)
      const result = res.data.data || res.data
      setData(result)
      setCache(cacheKey, result)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [endpoint, cacheKey])

  useEffect(() => {
    const cached = getCache(cacheKey)
    if (cached) {
      setData(cached.data)
      setLoading(false)
    } else {
      fetchAll()
    }
  }, [cacheKey, fetchAll])

  const crear = async (body) => {
    try {
      await api.post(`/${endpoint}`, body)
      toast.success('Registro creado ✓')
      fetchAll()
      return true
    } catch (e) {
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Error al crear')
      return false
    }
  }

  const actualizar = async (id, body) => {
    try {
      await api.put(`/${endpoint}/${id}`, body)
      toast.success('Registro actualizado ✓')
      fetchAll()
      return true
    } catch (e) {
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Error al actualizar')
      return false
    }
  }

  const eliminar = async (id, confirmMsg) => {
    if (!confirm(confirmMsg || '¿Eliminar este registro?')) return
    try {
      await api.delete(`/${endpoint}/${id}`)
      toast.success('Eliminado correctamente')
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al eliminar')
    }
  }

  return { data, loading, crear, actualizar, eliminar, fetchAll }
}