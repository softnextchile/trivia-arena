import { useState, useEffect, useMemo } from 'react'
import { api } from '../../utils/api'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 15

export default function Questions({ showToast }) {
  const [questions, setQuestions] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterSubcategory, setFilterSubcategory] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [form, setForm] = useState({
    subcategory_id: '',
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    level: 'facil'
  })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchQuestions = async () => {
    try {
      const params = filterSubcategory ? { subcategory_id: filterSubcategory } : {}
      const data = await api.questions(params)
      setQuestions(data)
    } catch (err) {
      showToast('Error cargando preguntas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const data = await api.subcategories()
      setSubcategories(data)
    } catch (err) {
      showToast('Error cargando subcategorías', 'error')
    }
  }

  useEffect(() => { fetchSubcategories() }, [])
  useEffect(() => { fetchQuestions() }, [filterSubcategory])

  const filtered = useMemo(() => {
    let list = questions
    if (filterLevel) list = list.filter((q) => q.level === filterLevel)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((x) =>
        [x.question, x.explanation, x.subcategory_name, x.category_name].some((v) => v && v.toLowerCase().includes(q))
      )
    }
    return list
  }, [questions, search, filterLevel])

  useEffect(() => { setPage(1) }, [search, filterSubcategory, filterLevel])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, subcategory_id: parseInt(form.subcategory_id) }
      if (editing) {
        await api.updateQuestion(editing.id, payload)
        showToast('Pregunta actualizada')
      } else {
        await api.createQuestion(payload)
        showToast('Pregunta creada')
      }
      setShowModal(false)
      setEditing(null)
      setForm({
        subcategory_id: subcategories[0]?.id || '',
        question: '',
        options: ['', '', '', ''],
        answer: 0,
        explanation: '',
        level: 'facil'
      })
      fetchQuestions()
    } catch (err) {
      showToast(err.message || 'Error guardando', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta pregunta?')) return
    try {
      await api.deleteQuestion(id)
      showToast('Pregunta eliminada')
      fetchQuestions()
    } catch (err) {
      showToast(err.message || 'Error eliminando', 'error')
    }
  }

  const openEdit = (q) => {
    setEditing(q)
    setForm({
      subcategory_id: q.subcategory_id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation || '',
      level: q.level
    })
    setShowModal(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm({
      subcategory_id: subcategories[0]?.id || '',
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: '',
      level: 'facil'
    })
    setShowModal(true)
  }

  const updateOption = (index, value) => {
    const newOptions = [...form.options]
    newOptions[index] = value
    setForm({ ...form, options: newOptions })
  }

  const getLevelBadge = (level) => {
    const styles = {
      facil: 'bg-green-500/20 text-green-400 border-green-500/50',
      medio: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      dificil: 'bg-red-500/20 text-red-400 border-red-500/50'
    }
    const labels = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' }
    return <span className={`px-2 py-1 rounded-lg text-xs border ${styles[level]}`}>{labels[level]}</span>
  }

  if (loading) return <div className="text-white">Cargando...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-white">Preguntas</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar pregunta..." />
          <button onClick={openNew} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            + Nueva Pregunta
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-white/50 text-xs uppercase tracking-wider mb-1">Subcategoría</label>
          <select
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value ? parseInt(e.target.value) : '')}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 min-w-[260px]"
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

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-white/50 text-sm self-center mr-1">Nivel:</span>
        <button
          onClick={() => setFilterLevel('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            !filterLevel ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Todos
        </button>
        {[
          { id: 'facil', label: 'Fácil' },
          { id: 'medio', label: 'Medio' },
          { id: 'dificil', label: 'Difícil' }
        ].map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => setFilterLevel(lvl.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterLevel === lvl.id ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Pregunta</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Subcategoría</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Nivel</th>
              <th className="text-left px-6 py-4 text-white/60 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  {search ? `No se encontraron preguntas con "${search}"` : 'No hay preguntas'}
                </td>
              </tr>
            ) : (
              paged.map((q) => (
                <tr key={q.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">
                    <span className="line-clamp-1">{q.question}</span>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {q.category_name} / {q.subcategory_name}
                  </td>
                  <td className="px-6 py-4">{getLevelBadge(q.level)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEdit(q)} className="text-purple-400 hover:text-purple-300 mr-4">Editar</button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-white/20 my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {editing ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Subcategoría</label>
                <select value={form.subcategory_id} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" required>
                  <option value="">Seleccionar subcategoría</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.category_name} - {sub.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Pregunta</label>
                <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 h-24 resize-none" required />
              </div>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Opciones (mínimo 4)</label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-white/40 w-6">{String.fromCharCode(65 + i)}</span>
                      <input type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Respuesta correcta (índice 0-3)</label>
                <select value={form.answer} onChange={(e) => setForm({ ...form, answer: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  {form.options.map((opt, i) => (
                    <option key={i} value={i}>{String.fromCharCode(65 + i)}: {opt || `Opción ${i + 1}`}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Explicación</label>
                <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 h-20 resize-none" />
              </div>
              <div className="mb-6">
                <label className="block text-white/60 text-sm mb-1">Nivel</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
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
