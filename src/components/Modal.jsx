import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, onSubmit, submitLabel = 'Guardar' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            Cancelar
          </button>
          <button onClick={onSubmit}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#E87C1E] hover:bg-[#C4610E] text-white transition shadow-md shadow-[#E87C1E]/30">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}