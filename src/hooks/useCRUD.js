import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export function useCRUD(endpoint) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/${endpoint}`)
      setData(res.data.data || res.data)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const crear = async (body) => {
    try {
      await api.post(`/${endpoint}`, body)
      toast.success('Registro creado ✓')
      fetchAll()
      return true
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al crear')
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
      toast.error(e.response?.data?.message || 'Error al actualizar')
      return false
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await api.delete(`/${endpoint}/${id}`)
      toast.success('Eliminado correctamente')
      fetchAll()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  useEffect(() => { fetchAll() }, [endpoint])

  return { data, loading, crear, actualizar, eliminar, fetchAll }
}