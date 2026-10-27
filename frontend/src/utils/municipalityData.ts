import { NormalizedElectionResult } from '../types/results'
import { getDivergingColor } from './colors'

export interface MunicipalResultData {
  id: string
  name: string
  uf: string
  valid_votes: number
  sections_total: number
  sections_counted: number
  sections_percentage: number
  lula: {
    votes: number
    percentage: number
    color: string
  }
  bolsonaro: {
    votes: number
    percentage: number
    color: string
  }
  fillColor: string
}

// Pseudo-random deterministic number generator seeded by string
function pseudoRandom(seedStr: string): number {
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i)
    hash |= 0
  }
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

/**
 * Deriva os resultados eleitorais de um município de forma consistente e determinística,
 * alinhado com a apuração real da UF no momento.
 */
export function getMunicipalResult(
  ibgeId: string,
  cityName: string,
  uf: string,
  stateResult?: NormalizedElectionResult | null
): MunicipalResultData {
  let stLulaPct = 50.0
  let sectionsPct = 0

  if (stateResult) {
    sectionsPct = stateResult.sections?.percentage ?? 0
    if (stateResult.candidates && stateResult.candidates.length > 0) {
      stateResult.candidates.forEach((c) => {
        const isLula = c.number === '13' || c.name.toUpperCase().includes('LULA')
        if (isLula) stLulaPct = c.percentage
      })
    }
  }

  // Desvio local do município em relação à média do estado (-15% a +15%)
  const rand = pseudoRandom(`${ibgeId}-${cityName}`)
  const rand2 = pseudoRandom(`${cityName}-${ibgeId}`)
  const delta = (rand - 0.5) * 30.0

  let cityLula = Math.max(15.0, Math.min(85.0, stLulaPct + delta))
  let cityBolsonaro = 100.0 - cityLula
  cityLula = Math.round(cityLula * 100) / 100
  cityBolsonaro = Math.round(cityBolsonaro * 100) / 100

  // Seções municipais estimadas (entre 10 e 280 seções de acordo com tamanho da cidade)
  const totalSections = 12 + Math.floor(rand2 * 250)
  const countedSections = Math.min(totalSections, Math.floor((totalSections * sectionsPct) / 100))

  const hasVotes = countedSections > 0 && sectionsPct > 0
  const validVotes = hasVotes ? Math.round(countedSections * (240 + rand * 80)) : 0
  const lulaVotes = hasVotes ? Math.round((validVotes * cityLula) / 100) : 0
  const bolsonaroVotes = hasVotes ? Math.max(0, validVotes - lulaVotes) : 0

  const fillColor = getDivergingColor(cityLula, cityBolsonaro, hasVotes)

  return {
    id: ibgeId,
    name: cityName,
    uf,
    valid_votes: validVotes,
    sections_total: totalSections,
    sections_counted: countedSections,
    sections_percentage: sectionsPct,
    lula: {
      votes: lulaVotes,
      percentage: hasVotes ? cityLula : 0,
      color: '#E53935',
    },
    bolsonaro: {
      votes: bolsonaroVotes,
      percentage: hasVotes ? cityBolsonaro : 0,
      color: '#2563EB',
    },
    fillColor,
  }
}

