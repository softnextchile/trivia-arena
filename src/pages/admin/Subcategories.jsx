import { useState, useEffect, useMemo } from 'react'
import { api } from '../../utils/api'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 10

export default function Subcategories({ showToast }) {
  const [subcategories, setSubcategories] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSubcategory, setFilterSubcategory] = useState('')
  const [form, setForm] = useState({ name: '', slug: '', category_id: '', description: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchSubcategories = async () => {
    try {
      const params = filterCategory ? { category_id: filterCategory } : {}
      const data = await api.subcategories(params)
      setSubcategories(data)
    } catch (err) {
      showToast('Error cargando subcategorías', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await api.adminCategories()
      setCategories(data)
    } catch (err) {
      showToast('Error cargando categorías', 'error')
    }
  }

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchSubcategories() }, [filterCategory])

  const filtered = useMemo(() => {
    let list = subcategories
    if (filterSubcategory) list = list.filter((s) => s.id === filterSubcategory)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((s) =>
        [s.name, s.slug, s.description, s.category_name].some((v) => v && v.toLowerCase().includes(q))
      )
    }
    return list
  }, [subcategories, search, filterSubcategory])

  useEffect(() => { setPage(1) }, [search, filterCategory, filterSubcategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, category_id: parseInt(form.category_id) }
      if (editing) {
        await api.updateSubcategory(editing.id, payload)
        showToast('Subcategoría actualizada')
      } else {
        await api.createSubcategory(payload)
        showToast('Subcategoría creada')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', slug: '', category_id: categories[0]?.id || '', description: '' })
      fetchSubcategories()
    } catch (err) {
      showToast(err.message || 'Error guardando', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta subcategoría? Se eliminarán todas sus preguntas.')) return
    try {
      await api.deleteSubcategory(id)
      showToast('Subcategoría eliminada')
      fetchSubcategories()
    } catch (err) {
      showToast(err.message || 'Error eliminando', 'error')
    }
  }

  const openEdit = (sub) => {
    setEditing(sub)
    setForm({ name: sub.name, slug: sub.slug, category_id: sub.category_id, description: sub.description || '' })
    setShowModal(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', slug: '', category_id: categories[0]?.id || '', description: '' })
    setShowModal(true)
  }

  if (loading) return <div className="text-white">Cargando...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-white">Subcategorías</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar subcategoría..." />
          <button onClick={openNew} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            + Nueva Subcategoría
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-white/50 text-xs uppercase tracking-wider mb-1">Categoría</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value ? parseInt(e.target.value) : '')}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 min-w-[220px]"
          >
            <option value="">Todas ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-white/50 text-xs uppercase tracking-wider mb-1">Subcategoría</label>
          <select
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value ? parseInt(e.target.value) : '')}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 min-w-[280px]"
          >
            <option value="">Todas ({subcategories.length})</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.category_name} — {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Nombre</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Slug</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Categoría</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  {search ? `No se encontraron subcategorías con "${search}"` : 'No hay subcategorías'}
                </td>
              </tr>
            ) : (
              paged.map((sub) => (
                <tr key={sub.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-medium">{sub.name}</td>
                  <td className="px-6 py-4 text-white/60">{sub.slug}</td>
                  <td className="px-6 py-4 text-white/60">{sub.category_name}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEdit(sub)} className="text-purple-400 hover:text-purple-300 mr-4">Editar</button>
                    <button onClick={() => handleDelete(sub.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
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
              {editing ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
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
                <label className="block text-white/60 text-sm mb-1">Categoría</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" required>
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-white/60 text-sm mb-1">Descripción</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" />
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
