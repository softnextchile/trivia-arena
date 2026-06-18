import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import Categories from './Categories'
import Subcategories from './Subcategories'
import Questions from './Questions'

export default function Dashboard() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Determine current section from URL
  const path = window.location.pathname
  let currentSection = 'categories'
  if (path.includes('subcategories')) currentSection = 'subcategories'
  if (path.includes('questions')) currentSection = 'questions'

  const navItems = [
    { id: 'categories', label: 'Categorías', path: '/admin/categories', icon: '📁' },
    { id: 'subcategories', label: 'Subcategorías', path: '/admin/subcategories', icon: '📋' },
    { id: 'questions', label: 'Preguntas', path: '/admin/questions', icon: '❓' },
  ]

  const renderContent = () => {
    switch (currentSection) {
      case 'subcategories':
        return <Subcategories showToast={showToast} />
      case 'questions':
        return <Questions showToast={showToast} />
      default:
        return <Categories showToast={showToast} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">⚙️ Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Trivia Arena</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive || (item.id === 'categories' && window.location.pathname === '/admin')
                        ? 'bg-purple-500/30 text-white border border-purple-500/50'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}