import { useState, useEffect, useMemo } from 'react'
import { api } from '../../utils/api'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 10

export default function Categories({ showToast }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchCategories = async () => {
    try {
      const data = await api.adminCategories()
      setCategories(data)
    } catch (err) {
      showToast('Error cargando categorías', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) =>
      [c.name, c.slug, c.description, c.icon].some((v) => v && v.toLowerCase().includes(q))
    )
  }, [categories, search])

  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.updateCategory(editing.id, form)
        showToast('Categoría actualizada')
      } else {
        await api.createCategory(form)
        showToast('Categoría creada')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', slug: '', description: '', icon: '' })
      fetchCategories()
    } catch (err) {
      showToast(err.message || 'Error guardando', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría? Se eliminarán todas sus subcategorías y preguntas.')) return
    try {
      await api.deleteCategory(id)
      showToast('Categoría eliminada')
      fetchCategories()
    } catch (err) {
      showToast(err.message || 'Error eliminando', 'error')
    }
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '' })
    setShowModal(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', icon: '' })
    setShowModal(true)
  }

  if (loading) return <div className="text-white">Cargando...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Categorías</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar categoría..." />
          <button
            onClick={openNew}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            + Nueva Categoría
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Nombre</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Slug</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Subcategorías</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  {search ? `No se encontraron categorías con "${search}"` : 'No hay categorías'}
                </td>
              </tr>
            ) : (
              paged.map((cat) => (
                <tr key={cat.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-white/60">{cat.slug}</td>
                  <td className="px-6 py-4 text-white/60">{cat.subcategory_count || 0}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEdit(cat)} className="text-purple-400 hover:text-purple-300 mr-4">Editar</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              {editing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Nombre</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Descripción</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="mb-6">
                <label className="block text-white/60 text-sm mb-1">Icono</label>
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="sport, music, lightbulb..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
