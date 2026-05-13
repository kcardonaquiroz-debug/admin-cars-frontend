import { Loader2 } from 'lucide-react'

export default function Table({ columns, data, loading, renderRow }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-[#E87C1E]" size={24} />
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                Sin registros
              </td></tr>
            ) : (
              data.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                  {renderRow(item)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}