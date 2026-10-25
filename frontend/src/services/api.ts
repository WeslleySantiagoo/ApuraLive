import { NormalizedElectionResult, IrreversibilityResponse } from '../types/results'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchBrazilResults(): Promise<NormalizedElectionResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/results/brazil`)
  if (!res.ok) {
    throw new Error(`Erro ao consultar resultados nacionais: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchIrreversibility(): Promise<IrreversibilityResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/analysis/irreversibility`)
  if (!res.ok) {
    throw new Error(`Erro ao consultar cálculo de irreversibilidade: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchRegionalResults(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE_URL}/api/v1/results/regions`)
  if (!res.ok) {
    throw new Error(`Erro ao consultar resultados regionais: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchStateResults(): Promise<NormalizedElectionResult[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/results/states`)
  if (!res.ok) {
    throw new Error(`Erro ao consultar resultados dos estados: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchRankings(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/analysis/rankings`)
  if (!res.ok) {
    throw new Error(`Erro ao consultar rankings: ${res.statusText}`)
  }
  return res.json()
}

