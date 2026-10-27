/**
 * Utilitário de interpolação e cálculo da escala divergente tricolor:
 * Vermelho (#E53935) <----> Cinza Neutro (#3f3f46 / #27272a) <----> Azul (#2563EB)
 *
 * Regras:
 * - Se ambos os candidatos estiverem rigorosamente empatados (ou 50%/50%), cor cinza neutro.
 * - Se Lula estiver à frente (> 50%), a cor será tons de vermelho, com intensidade baseada na margem.
 * - Se Flávio Bolsonaro estiver à frente (> 50%), a cor será tons de azul, com intensidade baseada na margem.
 * - Diferença maior = cor mais intensa/saturada.
 */

// Cor neutra central (zinc-700 / zinc-800)
const NEUTRAL_GRAY = { r: 63, g: 63, b: 70 } // #3f3f46
const EMPTY_GRAY = '#18181b' // zinc-900

// Extremos
const RED_LULA = { r: 229, g: 57, b: 53 } // #E53935 (puro)
const BLUE_BOLSONARO = { r: 37, g: 99, b: 235 } // #2563EB (puro)

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function interpolateRgb(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number): string {
  const factor = Math.max(0, Math.min(1, t))
  const r = c1.r + (c2.r - c1.r) * factor
  const g = c1.g + (c2.g - c1.g) * factor
  const b = c1.b + (c2.b - c1.b) * factor
  return rgbToHex(r, g, b)
}

/**
 * Retorna a cor calculada baseada na votação de Lula vs Bolsonaro.
 * @param lulaPct Porcentagem de Lula (0 a 100)
 * @param bolsonaroPct Porcentagem de Bolsonaro (0 a 100)
 * @param hasVotes Indica se há votos apurados
 */
export function getDivergingColor(lulaPct: number, bolsonaroPct: number, hasVotes = true): string {
  if (!hasVotes || (lulaPct === 0 && bolsonaroPct === 0)) {
    return EMPTY_GRAY
  }

  const diff = lulaPct - bolsonaroPct // e.g. +10.0 (Lula +10%) or -15.0 (Bolsonaro +15%)

  // Se empatados em 50% / 50% ou diferença quase zero (< 0.2%)
  if (Math.abs(diff) < 0.2) {
    return rgbToHex(NEUTRAL_GRAY.r, NEUTRAL_GRAY.g, NEUTRAL_GRAY.b)
  }

  // Fator de intensidade baseado na liderança:
  // Se o líder tem 50%, intensidade é 0 (cinza).
  // Se o líder tem 75% ou mais (diferença >= 50%), intensidade é 100% (cor sólida).
  const margin = Math.abs(diff) // 0 a 100
  // Interpola suavemente de 0 a 1 em um intervalo de diferença de 0% a 40%
  const t = Math.min(1, Math.max(0.15, margin / 40))

  if (diff > 0) {
    // Lula à frente -> interpola de NEUTRAL_GRAY para RED_LULA
    return interpolateRgb(NEUTRAL_GRAY, RED_LULA, t)
  } else {
    // Bolsonaro à frente -> interpola de NEUTRAL_GRAY para BLUE_BOLSONARO
    return interpolateRgb(NEUTRAL_GRAY, BLUE_BOLSONARO, t)
  }
}
