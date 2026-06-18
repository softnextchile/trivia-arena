/**
 * Mezcla un array aleatoriamente (Fisher-Yates)
 */
export function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Obtiene 5 preguntas aleatorias de una categoría y nivel
 */
export function getQuestionsByCategoryAndLevel(category, level, allQuestions) {
  const filtered = allQuestions.filter(
    (q) => q.category === category && q.level === level
  )
  return shuffleArray(filtered).slice(0, 5)
}

/**
 * Calcula el score final
 * @param {number} correct - cantidad de respuestas correctas
 * @param {number} timeLeft - tiempo剩余 en segundos
 * @param {string} level - 'facil' | 'medio' | 'dificil'
 * @returns {number} puntos totales
 */
export function calculateScore(correct, timeLeft, level) {
  const multipliers = { facil: 1, medio: 1.5, dificil: 2 }
  const basePoints = correct * 100
  const timeBonus = timeLeft * 5
  return Math.round((basePoints + timeBonus) * (multipliers[level] || 1))
}

/**
 * Tiempo límite por nivel en segundos
 */
export function getTimePerLevel(level) {
  return { facil: 30, medio: 20, dificil: 12 }[level] || 30
}

/**
 * Devuelve label legible de categoría
 */
export function getCategoryLabel(category) {
  const labels = {
    deportes: '🏀 Deportes',
    futbol: '⚽ Fútbol',
    basquet: '🏀 Básquet',
    tenis: '🎾 Tenis',
    musica: '🎵 Música',
    general: '🧠 Conocimiento General'
  }
  return labels[category] || category
}