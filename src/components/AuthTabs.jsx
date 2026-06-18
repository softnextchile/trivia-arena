import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, UserPlus, LogIn, Mail, Lock, AtSign, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api, setStoredUser } from '../utils/api'

export default function AuthTabs({ onAuthenticated, onClose }) {
  const [mode, setMode] = useState('guest')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e?.preventDefault?.()
    if (loading) return
    setLoading(true)
    try {
      let user
      if (mode === 'guest') {
        if (!name.trim()) throw new Error('Ingresa tu nombre')
        user = await api.guest(name.trim(), email.trim() || undefined)
      } else if (mode === 'register') {
        if (!name.trim() || !email.trim() || !password) throw new Error('Completa todos los campos')
        if (password !== confirm) throw new Error('Las contraseñas no coinciden')
        if (password.length < 4) throw new Error('Contraseña mínimo 4 caracteres')
        user = await api.register(name.trim(), email.trim(), password)
      } else {
        if (!email.trim() || !password) throw new Error('Completa todos los campos')
        user = await api.login(email.trim(), password)
      }
      setStoredUser(user)
      toast.success(mode === 'login' ? `¡Bienvenido de vuelta, ${user.name}!` : `¡Hola, ${user.name}!`)
      onAuthenticated?.(user)
    } catch (err) {
      toast.error(err.message || 'Error al autenticar')
    } finally {
      setLoading(false)
    }
  }

  const tabClass = (id) =>
    `flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all rounded-t-xl ${
      mode === id
        ? 'bg-white/15 text-white'
        : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
    }`

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
    >
      <div className="flex">
        <button onClick={() => setMode('guest')} className={tabClass('guest')}>
          <User className="w-4 h-4" /> Invitado
        </button>
        <button onClick={() => setMode('register')} className={tabClass('register')}>
          <UserPlus className="w-4 h-4" /> Registrarme
        </button>
        <button onClick={() => setMode('login')} className={tabClass('login')}>
          <LogIn className="w-4 h-4" /> Entrar
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 text-white/40 hover:text-white"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <AnimatePresence mode="wait">
          {mode === 'guest' && (
            <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Field
                icon={<User className="w-4 h-4" />}
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={setName}
                maxLength={20}
                autoFocus
              />
              <Field
                icon={<Mail className="w-4 h-4" />}
                type="email"
                placeholder="Email (opcional, para guardar tu progreso)"
                value={email}
                onChange={setEmail}
              />
            </motion.div>
          )}
          {mode === 'register' && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Field icon={<User className="w-4 h-4" />} type="text" placeholder="Tu nombre" value={name} onChange={setName} maxLength={20} autoFocus />
              <Field icon={<AtSign className="w-4 h-4" />} type="email" placeholder="Email" value={email} onChange={setEmail} />
              <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="Contraseña (mín. 4)" value={password} onChange={setPassword} />
              <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="Repetir contraseña" value={confirm} onChange={setConfirm} />
            </motion.div>
          )}
          {mode === 'login' && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Field icon={<AtSign className="w-4 h-4" />} type="email" placeholder="Email" value={email} onChange={setEmail} autoFocus />
              <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="Contraseña" value={password} onChange={setPassword} />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30"
        >
          {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Continuar'}
        </button>
      </form>
    </motion.div>
  )
}

function Field({ icon, type, placeholder, value, onChange, maxLength, autoFocus }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
      />
    </div>
  )
}
