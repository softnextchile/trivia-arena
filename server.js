import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'trivia-admin-2026'

app.use(cors())
app.use(express.json())

const dataDir = join(__dirname, 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = process.env.DB_PATH || join(dataDir, 'ranking.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subcategory_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    answer INTEGER NOT NULL,
    explanation TEXT,
    level TEXT NOT NULL CHECK(level IN ('facil','medio','dificil')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT,
    is_guest INTEGER DEFAULT 1,
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    unlocked INTEGER DEFAULT 0,
    completed_at DATETIME,
    UNIQUE(user_id, category, level),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS perfect_runs (
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, category, level)
  );
`)

function safeAlter(table, column, definition) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all()
    if (!cols.find(c => c.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    }
  } catch (e) {}
}

function ensureUniqueSubcategoryNames() {
  const renames = {
    ciencia: 'Ciencia General',
    cine: 'Cine General',
    historia: 'Historia General',
    musica: 'Música General'
  }
  for (const [catSlug, newName] of Object.entries(renames)) {
    db.prepare(`
      UPDATE subcategories SET name = ?
      WHERE name = 'General'
      AND category_id = (SELECT id FROM categories WHERE slug = ?)
    `).run(newName, catSlug)
  }
}

safeAlter('users', 'password_hash', 'TEXT')
safeAlter('users', 'is_guest', 'INTEGER DEFAULT 1')
safeAlter('scores', 'user_id', 'INTEGER')

try {
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL')
} catch (e) {}

const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password']
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_PASSWORD, message: 'Login exitoso' })
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' })
  }
})

// ========== USER AUTH ==========

const slugify = (s) => s.toString().toLowerCase().trim()
  .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e')
  .replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o')
  .replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email y password son requeridos' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' })
    }
    const emailKey = email.trim().toLowerCase()
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(emailKey)
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }
    const hash = await bcrypt.hash(password, 10)
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, is_guest, total_score, games_played)
      VALUES (?, ?, ?, 0, 0, 0)
    `).run(name.trim(), emailKey, hash)
    const user = db.prepare('SELECT id, name, email, total_score, games_played, is_guest FROM users WHERE id = ?').get(result.lastInsertRowid)
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' })
    }
    const emailKey = email.trim().toLowerCase()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailKey)
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    res.json({
      id: user.id, name: user.name, email: user.email,
      total_score: user.total_score, games_played: user.games_played, is_guest: 0
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/users/guest', (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name es requerido' })
    }
    if (email) {
      const emailKey = email.trim().toLowerCase()
      const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(emailKey)
      if (existing) {
        if (existing.password_hash) {
          return res.status(409).json({ error: 'Este email ya está registrado. Inicia sesión.' })
        }
        return res.json({
          id: existing.id, name: existing.name, email: existing.email,
          total_score: existing.total_score, games_played: existing.games_played, is_guest: 1
        })
      }
    }
    const result = db.prepare(`
      INSERT INTO users (name, email, is_guest, total_score, games_played)
      VALUES (?, ?, 1, 0, 0)
    `).run(name.trim(), email ? email.trim().toLowerCase() : null)
    const user = db.prepare('SELECT id, name, email, total_score, games_played, is_guest FROM users WHERE id = ?').get(result.lastInsertRowid)
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, total_score, games_played, is_guest, created_at FROM users WHERE id = ?').get(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/users/:id/progress', (req, res) => {
  try {
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').all(req.params.id)
    res.json(progress)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/users/:id/badges', (req, res) => {
  try {
    const badges = db.prepare('SELECT * FROM badges WHERE user_id = ? ORDER BY awarded_at DESC').all(req.params.id)
    const recent = db.prepare(`
      SELECT name, score, category, level, correct, total, created_at
      FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(req.params.id)
    res.json({ badges, recent })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== SCORES ==========

app.get('/api/scores', (req, res) => {
  try {
    const top = db.prepare(`
      SELECT id, user_id, name, score, category, level, correct, total, created_at
      FROM scores ORDER BY score DESC LIMIT 100
    `).all()
    res.json(top)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/scores/:category', (req, res) => {
  try {
    const top = db.prepare(`
      SELECT id, user_id, name, score, category, level, correct, total, created_at
      FROM scores WHERE category = ? ORDER BY score DESC LIMIT 50
    `).all(req.params.category)
    res.json(top)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const awardBadges = (userId, category, level, correct, total, score) => {
  const awarded = []
  const award = (code) => {
    try {
      db.prepare('INSERT OR IGNORE INTO badges (user_id, code) VALUES (?, ?)').run(userId, code)
      const exists = db.prepare('SELECT 1 FROM badges WHERE user_id = ? AND code = ?').get(userId, code)
      if (exists && !awarded.find(b => b.code === code)) awarded.push({ code })
    } catch (e) {}
  }

  const games = db.prepare('SELECT COUNT(*) as c FROM scores WHERE user_id = ?').get(userId).c
  if (games >= 1) award('first_game')
  if (games >= 5) award('games_5')
  if (games >= 10) award('games_10')
  if (games >= 25) award('games_25')
  if (correct === total && total > 0) {
    award('perfect')
    try {
      db.prepare(`
        INSERT INTO perfect_runs (user_id, category, level, count) VALUES (?, ?, ?, 1)
        ON CONFLICT(user_id, category, level) DO UPDATE SET count = count + 1
      `).run(userId, category, level)
    } catch (e) {}
  }
  const perfects = db.prepare(`
    SELECT COUNT(*) as c FROM (
      SELECT category, level, MAX(correct) as best, MAX(total) as t
      FROM scores WHERE user_id = ? GROUP BY category, level
    ) WHERE best = t AND t > 0
  `).get(userId).c
  if (perfects >= 3) award('perfect_3')

  const mastered = db.prepare(`
    SELECT 1 FROM user_progress
    WHERE user_id = ? AND completed = 1
    GROUP BY category
    HAVING COUNT(DISTINCT level) >= 3
  `).all(userId)
  if (mastered.length > 0) award('category_master')

  const topGlobal = db.prepare(`
    SELECT user_id, SUM(score) as total FROM scores
    WHERE user_id IS NOT NULL
    GROUP BY user_id ORDER BY total DESC LIMIT 3
  `).all().map(r => r.user_id)
  if (topGlobal.includes(userId)) award('top_3')

  return awarded
}

app.post('/api/scores', async (req, res) => {
  try {
    const { name, score, category, level, correct, total, userId } = req.body
    if (!name || score == null) {
      return res.status(400).json({ error: 'name y score requeridos' })
    }

    const cat = category || 'general'
    const lvl = level || 'facil'
    const cor = correct || 0
    const tot = total || 5

    const stmt = db.prepare(`
      INSERT INTO scores (user_id, name, score, category, level, correct, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(userId || null, name, score, cat, lvl, cor, tot)

    let unlocked = null
    let mastered = false
    let badges = []

    if (userId) {
      db.prepare('UPDATE users SET total_score = total_score + ?, games_played = games_played + 1 WHERE id = ?').run(score, userId)

      const existingProgress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND category = ? AND level = ?').get(userId, cat, lvl)
      const passed = cor >= 4

      if (existingProgress) {
        if (score > existingProgress.score) {
          db.prepare('UPDATE user_progress SET score = ?, correct_answers = ?, total_questions = ? WHERE id = ?').run(score, cor, tot, existingProgress.id)
        }
        if (passed && !existingProgress.completed) {
          db.prepare('UPDATE user_progress SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(existingProgress.id)
        }
      } else {
        db.prepare(`
          INSERT INTO user_progress (user_id, category, level, correct_answers, total_questions, score, completed, unlocked)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, cat, lvl, cor, tot, score, passed ? 1 : 0, passed ? 1 : 0)
      }

      if (passed) {
        if (lvl === 'facil') {
          const existingMedio = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND category = ? AND level = ?').get(userId, cat, 'medio')
          if (!existingMedio) {
            db.prepare('INSERT INTO user_progress (user_id, category, level, unlocked) VALUES (?, ?, ?, 1)').run(userId, cat, 'medio')
            unlocked = 'medio'
          } else if (!existingMedio.unlocked) {
            db.prepare('UPDATE user_progress SET unlocked = 1 WHERE id = ?').run(existingMedio.id)
            unlocked = 'medio'
          }
        } else if (lvl === 'medio') {
          const existingDificil = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND category = ? AND level = ?').get(userId, cat, 'dificil')
          if (!existingDificil) {
            db.prepare('INSERT INTO user_progress (user_id, category, level, unlocked) VALUES (?, ?, ?, 1)').run(userId, cat, 'dificil')
            unlocked = 'dificil'
          } else if (!existingDificil.unlocked) {
            db.prepare('UPDATE user_progress SET unlocked = 1 WHERE id = ?').run(existingDificil.id)
            unlocked = 'dificil'
          }
        } else if (lvl === 'dificil') {
          mastered = true
        }
      }

      badges = awardBadges(userId, cat, lvl, cor, tot, score)
    }

    res.json({ id: result.lastInsertRowid, name, score, unlocked, mastered, badges })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== RANKING ACUMULADO ==========

app.get('/api/ranking/global', (req, res) => {
  try {
    const ranking = db.prepare(`
      SELECT
        COALESCE(s.user_id, 0) as user_id,
        s.name,
        MAX(u.email) as email,
        COALESCE(MAX(u.is_guest), 1) as is_guest,
        SUM(s.score) as total_score,
        COUNT(*) as games_played,
        MAX(s.score) as best_score
      FROM scores s
      LEFT JOIN users u ON u.id = s.user_id
      GROUP BY COALESCE(s.user_id, 0), s.name
      HAVING total_score > 0
      ORDER BY total_score DESC
      LIMIT 100
    `).all()
    res.json(ranking)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/ranking/category/:slug', (req, res) => {
  try {
    const { slug } = req.params
    const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)
    let slugs
    if (cat) {
      slugs = db.prepare('SELECT slug FROM subcategories WHERE category_id = ?').all(cat.id).map(s => s.slug)
      if (!slugs.includes(slug)) slugs.push(slug)
    } else {
      slugs = [slug]
    }
    if (slugs.length === 0) return res.json([])
    const placeholders = slugs.map(() => '?').join(',')
    const ranking = db.prepare(`
      SELECT
        COALESCE(s.user_id, 0) as user_id,
        s.name,
        MAX(u.email) as email,
        MAX(u.is_guest) as is_guest,
        SUM(s.score) as category_score,
        COUNT(*) as games_played,
        MAX(s.score) as best_score
      FROM scores s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.category IN (${placeholders})
      GROUP BY COALESCE(s.user_id, 0), s.name
      ORDER BY category_score DESC
      LIMIT 50
    `).all(...slugs)
    res.json(ranking)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== CATEGORIES CRUD ==========

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(s.id) as subcategory_count,
        (SELECT COUNT(*) FROM questions q
         JOIN subcategories ss ON ss.id = q.subcategory_id
         WHERE ss.category_id = c.id) as question_count
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `).all()
    res.json(categories)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/categories', adminAuth, (req, res) => {
  try {
    const { name, slug, description, icon } = req.body
    if (!name || !slug) return res.status(400).json({ error: 'name y slug son requeridos' })
    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)
    `).run(name, slug, description || '', icon || '')
    res.json({ id: result.lastInsertRowid, name, slug, description, icon })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/categories/:slug', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug)
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    const subcategories = db.prepare('SELECT * FROM subcategories WHERE category_id = ?').all(category.id)
    res.json({ ...category, subcategories })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/categories/:id', adminAuth, (req, res) => {
  try {
    const { name, slug, description, icon } = req.body
    db.prepare(`UPDATE categories SET name=?, slug=?, description=?, icon=? WHERE id=?`)
      .run(name, slug, description || '', icon || '', req.params.id)
    res.json({ id: req.params.id, name, slug, description, icon })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/categories/:id', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== SUBCATEGORIES CRUD ==========

app.get('/api/subcategories', (req, res) => {
  try {
    const { category_id, category_slug } = req.query
    let sql = `
      SELECT s.*, c.name as category_name, c.slug as category_slug
      FROM subcategories s
      JOIN categories c ON c.id = s.category_id
    `
    const params = []
    const where = []
    if (category_id) { where.push('s.category_id = ?'); params.push(category_id) }
    if (category_slug) { where.push('c.slug = ?'); params.push(category_slug) }
    if (where.length) sql += ' WHERE ' + where.join(' AND ')
    sql += ' ORDER BY c.name, s.name'
    res.json(db.prepare(sql).all(...params))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/subcategories', adminAuth, (req, res) => {
  try {
    const { name, slug, category_id, description } = req.body
    if (!name || !slug || !category_id) return res.status(400).json({ error: 'name, slug y category_id son requeridos' })
    const result = db.prepare(`
      INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)
    `).run(name, slug, category_id, description || '')
    res.json({ id: result.lastInsertRowid, name, slug, category_id, description })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/subcategories/:id', adminAuth, (req, res) => {
  try {
    const { name, slug, category_id, description } = req.body
    db.prepare(`UPDATE subcategories SET name=?, slug=?, category_id=?, description=? WHERE id=?`)
      .run(name, slug, category_id, description || '', req.params.id)
    res.json({ id: req.params.id, name, slug, category_id, description })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/subcategories/:id', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== QUESTIONS CRUD ==========

app.get('/api/questions', (req, res) => {
  try {
    const { subcategory_id } = req.query
    let sql = `
      SELECT q.*, s.name as subcategory_name, s.slug as subcategory_slug,
        c.name as category_name, c.slug as category_slug
      FROM questions q
      JOIN subcategories s ON s.id = q.subcategory_id
      JOIN categories c ON c.id = s.category_id
    `
    const params = []
    if (subcategory_id) { sql += ' WHERE q.subcategory_id = ?'; params.push(subcategory_id) }
    sql += ' ORDER BY c.name, s.name, q.id'
    const questions = db.prepare(sql).all(...params)
    res.json(questions.map(q => ({ ...q, options: JSON.parse(q.options) })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/questions', adminAuth, (req, res) => {
  try {
    const { subcategory_id, question, options, answer, explanation, level } = req.body
    if (!subcategory_id || !question || !options || answer == null || !level) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    const result = db.prepare(`
      INSERT INTO questions (subcategory_id, question, options, answer, explanation, level)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(subcategory_id, question, JSON.stringify(options), answer, explanation || '', level)
    res.json({ id: result.lastInsertRowid, subcategory_id, question, options, answer, explanation, level })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/questions/:id', adminAuth, (req, res) => {
  try {
    const { subcategory_id, question, options, answer, explanation, level } = req.body
    db.prepare(`
      UPDATE questions SET subcategory_id=?, question=?, options=?, answer=?, explanation=?, level=?
      WHERE id=?
    `).run(subcategory_id, question, JSON.stringify(options), answer, explanation || '', level, req.params.id)
    res.json({ id: req.params.id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/questions/:id', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== GAME ==========

app.get('/api/game/:category/:level', (req, res) => {
  try {
    const { category, level } = req.params
    const subcat = db.prepare('SELECT id, name, category_id FROM subcategories WHERE slug = ?').get(category)
    let questions
    if (subcat) {
      questions = db.prepare(`
        SELECT q.*, s.name as subcategory_name
        FROM questions q
        JOIN subcategories s ON s.id = q.subcategory_id
        WHERE s.slug = ? AND q.level = ? ORDER BY RANDOM() LIMIT 5
      `).all(category, level)
    } else {
      questions = db.prepare(`
        SELECT q.*, s.name as subcategory_name
        FROM questions q
        JOIN subcategories s ON s.id = q.subcategory_id
        JOIN categories c ON c.id = s.category_id
        WHERE c.slug = ? AND q.level = ? ORDER BY RANDOM() LIMIT 5
      `).all(category, level)
    }
    if (questions.length === 0) return res.status(404).json({ error: 'No hay preguntas para esta categoría y nivel' })
    res.json(questions.map(q => ({ ...q, options: JSON.parse(q.options) })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const BADGE_INFO = {
  first_game: { name: 'Primer Paso', icon: '🎯', desc: 'Juega tu primera partida' },
  games_5: { name: 'Aventurero', icon: '🎮', desc: 'Juega 5 partidas' },
  games_10: { name: 'Veterano', icon: '⚔️', desc: 'Juega 10 partidas' },
  games_25: { name: 'Dedicado', icon: '🔥', desc: 'Juega 25 partidas' },
  perfect: { name: 'Perfeccionista', icon: '💯', desc: 'Responde todo correcto en una partida' },
  perfect_3: { name: 'Imparable', icon: '⭐', desc: 'Tres partidas perfectas' },
  category_master: { name: 'Maestro', icon: '👑', desc: 'Domina una categoría completa' },
  top_3: { name: 'Élite', icon: '🏆', desc: 'Top 3 del ranking global' }
}

app.get('/api/badges/info', (req, res) => {
  res.json(BADGE_INFO)
})

app.use(express.static(join(__dirname, 'dist')))

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

async function seedData() {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get()
  if (categoryCount.count > 0) {
    console.log('Categories already exist, skipping seed')
    return
  }

  console.log('Seeding initial data...')

  const sportsId = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`)
    .run('Deportes', 'deportes', 'Todo sobre deportes', 'trophy').lastInsertRowid
  const futbolId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Fútbol', 'futbol', sportsId, 'Fútbol mundial').lastInsertRowid
  const basquetId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Básquetbol', 'basquet', sportsId, 'NBA y baloncesto').lastInsertRowid
  const tenisId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Tenis', 'tenis', sportsId, 'Grand Slams y más').lastInsertRowid

  const musicId = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`)
    .run('Música', 'musica', 'Canciones, artistas y géneros', 'music').lastInsertRowid
  const musicGeneralId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Música General', 'musica-general', musicId, 'Música en general').lastInsertRowid

  const cineId = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`)
    .run('Cine y TV', 'cine', 'Películas, series y famosos', 'film').lastInsertRowid
  const cineGeneralId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Cine General', 'cine-general', cineId, 'Cine y TV en general').lastInsertRowid

  const cienciaId = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`)
    .run('Ciencia', 'ciencia', 'Física, química, biología y más', 'flask').lastInsertRowid
  const cienciaGeneralId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Ciencia General', 'ciencia-general', cienciaId, 'Ciencia en general').lastInsertRowid

  const historiaId = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`)
    .run('Historia', 'historia', 'Eventos que cambiaron el mundo', 'scroll').lastInsertRowid
  const historiaGeneralId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Historia General', 'historia-general', historiaId, 'Historia universal').lastInsertRowid

  const generalId = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`)
    .run('Conocimiento General', 'general', 'Cultura y curiosidades', 'lightbulb').lastInsertRowid
  const culturaId = db.prepare(`INSERT INTO subcategories (name, slug, category_id, description) VALUES (?, ?, ?, ?)`)
    .run('Cultura General', 'cultura-general', generalId, 'Cultura general').lastInsertRowid

  const subByKey = {
    futbol: futbolId, basquet: basquetId, tenis: tenisId,
    musica: musicGeneralId, cine: cineGeneralId,
    ciencia: cienciaGeneralId, historia: historiaGeneralId,
    cultura: culturaId
  }

  const seedQuestions = [
    { key: 'futbol', level: 'facil', q: '¿Qué club ha ganado más Champions League?', opts: ['Barcelona','AC Milan','Real Madrid','Bayern Múnich'], a: 2, e: 'El Real Madrid ha ganado 15 Champions League, récord absoluto.' },
    { key: 'futbol', level: 'facil', q: '¿En qué país se inventó el fútbol moderno?', opts: ['Brasil','España','Inglaterra','Italia'], a: 2, e: 'Inglaterra es la cuna del fútbol moderno.' },
    { key: 'futbol', level: 'facil', q: '¿Cuántos jugadores hay en un equipo de fútbol sala?', opts: ['4','5','6','7'], a: 1, e: 'El fútbol sala se juega con 5 jugadores por equipo.' },
    { key: 'futbol', level: 'facil', q: '¿Qué significa "gol" en inglés?', opts: ['Goal','Gold','Shoot','Kick'], a: 0, e: 'Goal significa meta o portería.' },
    { key: 'futbol', level: 'facil', q: '¿Qué país ganó el Mundial de 2018?', opts: ['Brasil','Alemania','Francia','Argentina'], a: 2, e: 'Francia ganó el Mundial de Rusia 2018.' },
    { key: 'futbol', level: 'medio', q: '¿Quién es el máximo goleador en la historia de los Mundiales?', opts: ['Ronaldo','Miroslav Klose','Pelé','Gerd Müller'], a: 1, e: 'Miroslav Klose marcó 16 goles en Mundiales.' },
    { key: 'futbol', level: 'medio', q: '¿En qué año se celebró el primer Mundial de Fútbol?', opts: ['1928','1930','1934','1938'], a: 1, e: 'El primer Mundial se jugó en Uruguay en 1930.' },
    { key: 'futbol', level: 'medio', q: '¿Qué jugador tiene más Balones de Oro?', opts: ['Cristiano Ronaldo','Lionel Messi','Michel Platini','Franz Beckenbauer'], a: 1, e: 'Lionel Messi ha ganado 8 Balones de Oro.' },
    { key: 'futbol', level: 'medio', q: '¿Cuántos Mundiales ha ganado Brasil?', opts: ['4','5','6','7'], a: 1, e: 'Brasil ha ganado 5 Mundiales.' },
    { key: 'futbol', level: 'medio', q: '¿Qué club es conocido como "Los Diablos Rojos"?', opts: ['Liverpool','Chelsea','Manchester United','Arsenal'], a: 2, e: 'Manchester United es "Los Diablos Rojos".' },
    { key: 'futbol', level: 'dificil', q: '¿Cuántos goles marcó Just Fontaine en el Mundial de 1958?', opts: ['10','11','13','15'], a: 2, e: 'Just Fontaine marcó 13 goles, récord absoluto.' },
    { key: 'futbol', level: 'dificil', q: '¿Qué equipo ha ganado más ligas nacionales españolas?', opts: ['Barcelona','Real Madrid','Atlético de Madrid','Athletic Club'], a: 1, e: 'El Real Madrid tiene 36 ligas españolas.' },
    { key: 'futbol', level: 'dificil', q: '¿Quién fue el primer jugador en ganar 3 Mundiales?', opts: ['Pelé','Mário Zagallo','Cafu','Beckenbauer'], a: 0, e: 'Pelé ganó 3 Mundiales (1958, 1962, 1970).' },
    { key: 'futbol', level: 'dificil', q: '¿Cuál es el equipo con más títulos de Copa Libertadores?', opts: ['Boca Juniors','River Plate','Independiente','Peñarol'], a: 2, e: 'Independiente tiene 7 Copas Libertadores.' },

    { key: 'basquet', level: 'facil', q: '¿Cuántos jugadores hay en un equipo de baloncesto en pista?', opts: ['4','5','6','7'], a: 1, e: '5 jugadores por equipo.' },
    { key: 'basquet', level: 'facil', q: '¿En qué país se inventó el baloncesto?', opts: ['Estados Unidos','Canadá','Inglaterra','Francia'], a: 0, e: 'James Naismith lo inventó en EE.UU. en 1891.' },
    { key: 'basquet', level: 'facil', q: '¿Cuántos puntos vale una canasta de tres puntos?', opts: ['2','3','4','5'], a: 1, e: 'Una canasta desde fuera del arco vale 3 puntos.' },
    { key: 'basquet', level: 'facil', q: '¿Qué equipo tiene más títulos de la NBA?', opts: ['Chicago Bulls','Boston Celtics','Los Angeles Lakers','Golden State Warriors'], a: 1, e: 'Boston Celtics tiene 17 campeonatos.' },
    { key: 'basquet', level: 'facil', q: '¿Cuánto dura un partido de baloncesto NBA?', opts: ['40 minutos','48 minutos','50 minutos','60 minutos'], a: 1, e: '48 minutos en 4 cuartos de 12.' },
    { key: 'basquet', level: 'medio', q: '¿Quién es el máximo anotador histórico de la NBA?', opts: ['Michael Jordan','LeBron James','Kareem Abdul-Jabbar','Kobe Bryant'], a: 2, e: 'Kareem Abdul-Jabbar con 38.387 puntos.' },
    { key: 'basquet', level: 'medio', q: '¿Cuántos anillos de campeón tiene Michael Jordan?', opts: ['5','6','7','8'], a: 1, e: 'Jordan ganó 6 campeonatos con los Bulls.' },
    { key: 'basquet', level: 'medio', q: '¿En qué universidad estudió Michael Jordan?', opts: ['Duke','North Carolina','UCLA','Kentucky'], a: 1, e: 'Universidad de North Carolina.' },
    { key: 'basquet', level: 'medio', q: '¿Qué número usó Kobe Bryant en Lakers?', opts: ['8 y 24','23','33','10'], a: 0, e: 'Kobe usó el 8 y luego el 24.' },
    { key: 'basquet', level: 'dificil', q: '¿En qué draft de la NBA fue seleccionado Kobe Bryant?', opts: ['1994','1995','1996','1997'], a: 2, e: 'Draft de 1996, pick 13.' },
    { key: 'basquet', level: 'dificil', q: '¿Quién es el líder histórico de triples en la NBA?', opts: ['Stephen Curry','Ray Allen','James Harden','Reggie Miller'], a: 0, e: 'Stephen Curry es el líder histórico de triples.' },
    { key: 'basquet', level: 'dificil', q: '¿Qué jugador tiene el récord de puntos en un solo partido NBA?', opts: ['Wilt Chamberlain','Kobe Bryant','David Robinson','Michael Jordan'], a: 0, e: 'Wilt Chamberlain anotó 100 puntos en 1962.' },

    { key: 'tenis', level: 'facil', q: '¿Cuántos Grand Slams hay en tenis masculino?', opts: ['3','4','5','6'], a: 1, e: 'Australian Open, Roland Garros, Wimbledon y US Open.' },
    { key: 'tenis', level: 'facil', q: '¿En qué superficie se juega Wimbledon?', opts: ['Dura','Tierra batida','Césped','Moqueta'], a: 2, e: 'Wimbledon se juega sobre hierba.' },
    { key: 'tenis', level: 'facil', q: '¿Qué país ha ganado más Copas Davis?', opts: ['España','Estados Unidos','Australia','Francia'], a: 1, e: 'Estados Unidos con 32 Copas Davis.' },
    { key: 'tenis', level: 'facil', q: '¿Cómo se llama el torneo de tenis de Francia?', opts: ['Roland Garros','Open de Francia','Copa París','Master de París'], a: 0, e: 'Se llama Roland Garros.' },
    { key: 'tenis', level: 'medio', q: '¿Cuántos Grand Slams ha ganado Rafael Nadal?', opts: ['20','22','24','26'], a: 1, e: 'Nadal tiene 22 Grand Slams.' },
    { key: 'tenis', level: 'medio', q: '¿Quién es el tenista con más semanas como número 1?', opts: ['Roger Federer','Rafael Nadal','Novak Djokovic','Pete Sampras'], a: 2, e: 'Djokovic con más de 400 semanas.' },
    { key: 'tenis', level: 'medio', q: '¿En qué año ganó Federer su primer Wimbledon?', opts: ['2001','2003','2004','2006'], a: 1, e: 'Federer ganó su primer Wimbledon en 2003.' },
    { key: 'tenis', level: 'dificil', q: '¿Quién ha ganado más Masters 1000?', opts: ['Rafael Nadal','Novak Djokovic','Roger Federer','Andy Murray'], a: 1, e: 'Djokovic es el máximo ganador de Masters 1000.' },
    { key: 'tenis', level: 'dificil', q: '¿Cuántos títulos individuales ganó Serena Williams?', opts: ['20','23','28','30'], a: 1, e: 'Serena Williams tiene 73 títulos individuales WTA.' },

    { key: 'musica', level: 'facil', q: '¿Quién cantó "Bohemian Rhapsody"?', opts: ['Led Zeppelin','Queen','The Beatles','Pink Floyd'], a: 1, e: 'Es de Queen, escrita por Freddie Mercury.' },
    { key: 'musica', level: 'facil', q: '¿Cuántas cuerdas tiene una guitarra estándar?', opts: ['4','5','6','7'], a: 2, e: 'La guitarra estándar tiene 6 cuerdas.' },
    { key: 'musica', level: 'facil', q: '¿Cómo se llama el artista conocido como "El Rey del Pop"?', opts: ['Elvis Presley','Michael Jackson','Prince','Madonna'], a: 1, e: 'Michael Jackson es el Rey del Pop.' },
    { key: 'musica', level: 'facil', q: '¿Qué banda británica compuso "Hey Jude"?', opts: ['The Rolling Stones','The Beatles','Queen','The Who'], a: 1, e: 'The Beatles compuso "Hey Jude" en 1968.' },
    { key: 'musica', level: 'medio', q: '¿En qué año se separó The Beatles?', opts: ['1968','1970','1972','1975'], a: 1, e: 'The Beatles se separó en 1970.' },
    { key: 'musica', level: 'medio', q: '¿Quién compuso la Novena Sinfonía?', opts: ['Mozart','Bach','Beethoven','Chopin'], a: 2, e: 'Beethoven compuso la Novena Sinfonía en 1824.' },
    { key: 'musica', level: 'medio', q: '¿Cuál es el álbum más vendido de la historia?', opts: ['Thriller','Back in Black','The Dark Side of the Moon','Their Greatest Hits'], a: 0, e: 'Thriller de Michael Jackson, con más de 70 millones.' },
    { key: 'musica', level: 'dificil', q: '¿Qué instrumento toca principalmente Yo-Yo Ma?', opts: ['Violín','Piano','Chelo','Flauta'], a: 2, e: 'Yo-Yo Ma es un chelista estadounidense.' },
    { key: 'musica', level: 'dificil', q: '¿Quién escribió la ópera "La flauta mágica"?', opts: ['Verdi','Mozart','Wagner','Puccini'], a: 1, e: 'Mozart compuso La flauta mágica en 1791.' },

    { key: 'cine', level: 'facil', q: '¿Quién dirigió "Titanic" (1997)?', opts: ['Steven Spielberg','James Cameron','Ridley Scott','Martin Scorsese'], a: 1, e: 'James Cameron dirigió Titanic.' },
    { key: 'cine', level: 'facil', q: '¿Cómo se llama el mago protagonista de Harry Potter?', opts: ['Frodo','Harry Potter','Percy Jackson','Gandalf'], a: 1, e: 'Harry Potter es el protagonista.' },
    { key: 'cine', level: 'facil', q: '¿Qué estudio produjo "Toy Story" (1995)?', opts: ['DreamWorks','Pixar','Disney','Sony'], a: 1, e: 'Toy Story fue la primera película de Pixar.' },
    { key: 'cine', level: 'facil', q: '¿Quién interpreta a Iron Man en el MCU?', opts: ['Chris Evans','Robert Downey Jr.','Chris Hemsworth','Mark Ruffalo'], a: 1, e: 'Robert Downey Jr. interpreta a Tony Stark.' },
    { key: 'cine', level: 'medio', q: '¿Qué película ganó el primer Óscar a Mejor Película?', opts: ['Wings','Sunrise','The Jazz Singer','Metropolis'], a: 0, e: 'Wings (1927) ganó el primer Óscar.' },
    { key: 'cine', level: 'medio', q: '¿Quién dirigió "El Padrino"?', opts: ['Martin Scorsese','Francis Ford Coppola','Brian De Palma','Sergio Leone'], a: 1, e: 'Francis Ford Coppola dirigió El Padrino.' },
    { key: 'cine', level: 'medio', q: '¿En qué año se estrenó "Star Wars: Una nueva esperanza"?', opts: ['1975','1977','1979','1980'], a: 1, e: 'Se estrenó en 1977.' },
    { key: 'cine', level: 'dificil', q: '¿Cuántos Óscar ha ganado "Ben-Hur" (1959)?', opts: ['8','11','13','15'], a: 1, e: 'Ben-Hur ganó 11 Óscar, récord de la época.' },
    { key: 'cine', level: 'dificil', q: '¿Quién compuso la banda sonora de "El bueno, el malo y el feo"?', opts: ['Hans Zimmer','Ennio Morricone','John Williams','Howard Shore'], a: 1, e: 'Ennio Morricone compuso la banda sonora.' },

    { key: 'ciencia', level: 'facil', q: '¿Cuál es el símbolo químico del oro?', opts: ['Or','Au','Ag','O'], a: 1, e: 'El símbolo del oro es Au (del latín aurum).' },
    { key: 'ciencia', level: 'facil', q: '¿Cuántos planetas tiene el sistema solar?', opts: ['7','8','9','10'], a: 1, e: 'El sistema solar tiene 8 planetas.' },
    { key: 'ciencia', level: 'facil', q: '¿Qué gas es el más abundante en la atmósfera terrestre?', opts: ['Oxígeno','Dióxido de carbono','Nitrógeno','Hidrógeno'], a: 2, e: 'El nitrógeno representa ~78% de la atmósfera.' },
    { key: 'ciencia', level: 'facil', q: '¿Qué planeta es conocido como el planeta rojo?', opts: ['Venus','Marte','Júpiter','Saturno'], a: 1, e: 'Marte es el planeta rojo.' },
    { key: 'ciencia', level: 'medio', q: '¿Cuál es la velocidad de la luz en el vacío (aprox.)?', opts: ['150.000 km/s','300.000 km/s','450.000 km/s','1.000.000 km/s'], a: 1, e: 'La luz viaja a ~300.000 km/s.' },
    { key: 'ciencia', level: 'medio', q: '¿Qué partícula subatómica tiene carga negativa?', opts: ['Protón','Neutrón','Electrón','Positrón'], a: 2, e: 'El electrón tiene carga negativa.' },
    { key: 'ciencia', level: 'medio', q: '¿Cuántos huesos tiene el cuerpo humano adulto?', opts: ['186','206','226','246'], a: 1, e: 'El cuerpo humano adulto tiene 206 huesos.' },
    { key: 'ciencia', level: 'dificil', q: '¿Qué科学家 propuso la ley de la relatividad?', opts: ['Newton','Einstein','Galilei','Hawking'], a: 1, e: 'Einstein propuso la relatividad.' },
    { key: 'ciencia', level: 'dificil', q: '¿Cómo se llama la unidad básica de la vida?', opts: ['Átomo','Molécula','Célula','Gen'], a: 2, e: 'La célula es la unidad básica de la vida.' },

    { key: 'historia', level: 'facil', q: '¿En qué año cayó el Muro de Berlín?', opts: ['1987','1989','1991','1993'], a: 1, e: 'El Muro de Berlín cayó en 1989.' },
    { key: 'historia', level: 'facil', q: '¿Quién descubrió América en 1492?', opts: ['Vasco da Gama','Cristóbal Colón','Magallanes','Américo Vespucio'], a: 1, e: 'Cristóbal Colón llegó a América en 1492.' },
    { key: 'historia', level: 'facil', q: '¿Cuál fue la civilización que construyó las pirámides de Giza?', opts: ['Romanos','Griegos','Egipcios','Mayas'], a: 2, e: 'Los antiguos egipcios construyeron las pirámides.' },
    { key: 'historia', level: 'medio', q: '¿En qué año comenzó la Segunda Guerra Mundial?', opts: ['1937','1938','1939','1940'], a: 2, e: 'Comenzó en 1939 con la invasión a Polonia.' },
    { key: 'historia', level: 'medio', q: '¿Quién fue el primer presidente de Estados Unidos?', opts: ['Thomas Jefferson','John Adams','George Washington','Benjamin Franklin'], a: 2, e: 'George Washington fue el primero.' },
    { key: 'historia', level: 'medio', q: '¿En qué año se firmó la Declaración de Independencia de EE.UU.?', opts: ['1774','1776','1778','1781'], a: 1, e: 'Se firmó el 4 de julio de 1776.' },
    { key: 'historia', level: 'dificil', q: '¿Qué civilización construyó Machu Picchu?', opts: ['Azteca','Inca','Maya','Olmeca'], a: 1, e: 'Machu Picchu fue construido por los incas.' },
    { key: 'historia', level: 'dificil', q: '¿En qué año se disolvió la Unión Soviética?', opts: ['1989','1990','1991','1992'], a: 2, e: 'La Unión Soviética se disolvió en 1991.' },

    { key: 'cultura', level: 'facil', q: '¿Cuál es el océano más grande del mundo?', opts: ['Atlántico','Índico','Pacífico','Ártico'], a: 2, e: 'El Pacífico es el más grande.' },
    { key: 'cultura', level: 'facil', q: '¿En qué país está la Torre Eiffel?', opts: ['Italia','Francia','España','Alemania'], a: 1, e: 'La Torre Eiffel está en París, Francia.' },
    { key: 'cultura', level: 'facil', q: '¿Cuántos continentes hay en el mundo?', opts: ['5','6','7','8'], a: 2, e: 'Hay 7 continentes.' },
    { key: 'cultura', level: 'facil', q: '¿Cuál es la moneda de Japón?', opts: ['Yuan','Won','Yen','Dólar'], a: 2, e: 'La moneda es el Yen.' },
    { key: 'cultura', level: 'medio', q: '¿Cuál es el idioma más hablado del mundo por nativos?', opts: ['Inglés','Español','Mandarín','Hindi'], a: 2, e: 'El mandarín es el más hablado por nativos.' },
    { key: 'cultura', level: 'medio', q: '¿Cuál es el país más grande del mundo?', opts: ['Canadá','China','Estados Unidos','Rusia'], a: 3, e: 'Rusia es el país más grande del mundo.' },
    { key: 'cultura', level: 'medio', q: '¿Cuál es la capital de Australia?', opts: ['Sídney','Melbourne','Canberra','Perth'], a: 2, e: 'La capital es Canberra.' },
    { key: 'cultura', level: 'dificil', q: '¿En qué país se encuentra el desierto de Atacama?', opts: ['Perú','Argentina','Chile','Bolivia'], a: 2, e: 'El desierto de Atacama está en Chile.' },
    { key: 'cultura', level: 'dificil', q: '¿Cuál es el punto más alto de la Tierra sobre el nivel del mar?', opts: ['K2','Kangchenjunga','Monte Everest','Makalu'], a: 2, e: 'El Monte Everest con 8.849 m.' },
  ]

  const insertQuestion = db.prepare(`
    INSERT INTO questions (subcategory_id, question, options, answer, explanation, level)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const q of seedQuestions) {
    const subId = subByKey[q.key]
    if (subId) {
      insertQuestion.run(subId, q.q, JSON.stringify(q.opts), q.a, q.e, q.level)
    }
  }

  console.log(`Seed data inserted: ${seedQuestions.length} questions across ${Object.keys(subByKey).length} subcategories`)
}

app.listen(PORT, () => {
  console.log(`Trivia Arena API running on port ${PORT}`)
  ensureUniqueSubcategoryNames()
  seedData()
})
