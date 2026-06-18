const API_URL = import.meta.env.VITE_API_URL || ''

const TOKEN_KEY = 'adminToken'
const USER_KEY = 'triviaUser'

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY)
export const setAdminToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getAdminToken()
  if (token && path.startsWith('/api/admin') && path !== '/api/admin/login') {
    headers['x-admin-password'] = token
  }
  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  register: (name, email, password) =>
    request('/api/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request('/api/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  guest: (name, email) =>
    request('/api/users/guest', { method: 'POST', body: JSON.stringify({ name, email }) }),
  me: (id) => request(`/api/users/${id}`),
  progress: (id) => request(`/api/users/${id}/progress`),
  userBadges: (id) => request(`/api/users/${id}/badges`),
  badgeInfo: () => request('/api/badges/info'),
  categories: () => request('/api/categories'),
  category: (slug) => request(`/api/categories/${slug}`),
  subcategories: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/subcategories${qs ? `?${qs}` : ''}`)
  },
  questions: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/questions${qs ? `?${qs}` : ''}`)
  },
  game: (category, level) => request(`/api/game/${category}/${level}`),
  saveScore: (payload) => request('/api/scores', { method: 'POST', body: JSON.stringify(payload) }),
  rankingGlobal: () => request('/api/ranking/global'),
  rankingCategory: (slug) => request(`/api/ranking/category/${slug}`),

  adminLogin: (password) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  adminCategories: () => request('/api/categories'),
  adminCategory: (slug) => request(`/api/categories/${slug}`),
  createCategory: (data) => request('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),
  createSubcategory: (data) => request('/api/subcategories', { method: 'POST', body: JSON.stringify(data) }),
  updateSubcategory: (id, data) => request(`/api/subcategories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubcategory: (id) => request(`/api/subcategories/${id}`, { method: 'DELETE' }),
  createQuestion: (data) => request('/api/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id, data) => request(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id) => request(`/api/questions/${id}`, { method: 'DELETE' })
}

export const categoryIcon = (slug, fallback = '📚') => {
  const map = {
    deportes: '🏆', futbol: '⚽', basquet: '🏀', tenis: '🎾',
    musica: '🎵', cine: '🎬', ciencia: '🧪',
    historia: '📜', general: '💡',
    musica_general: '🎶', cine_general: '🎬', ciencia_general: '🔬',
    historia_general: '📜', cultura_general: '🌍'
  }
  return map[slug] || fallback
}

export const categoryColor = (id) => {
  const palette = [
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-indigo-600',
    'from-lime-500 to-green-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-fuchsia-500 to-purple-600',
    'from-teal-500 to-cyan-600'
  ]
  return palette[Math.abs(id) % palette.length]
}

export const avatarColor = (seed) => {
  const colors = [
    'from-red-400 to-pink-500',
    'from-orange-400 to-red-500',
    'from-amber-400 to-orange-500',
    'from-lime-400 to-green-500',
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
    'from-blue-400 to-indigo-500',
    'from-violet-400 to-purple-500',
    'from-fuchsia-400 to-pink-500',
    'from-rose-400 to-red-500'
  ]
  const h = String(seed).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[h % colors.length]
}
