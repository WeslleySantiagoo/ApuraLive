export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0'
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercentage(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0,00%'
  return (
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + '%'
  )
}

export function formatDateTime(isoString: string | undefined | null): string {
  if (!isoString) return '--'
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d)
  } catch {
    return isoString
  }
}

/**
 * Converte formatos de data/hora do TSE (ex: "25/10/2026T23:27:02" ou "2026-10-25T23:27:02")
 * para um formato amigável ao usuário: "25/10/2026 às 23:27:02".
 */
export function formatTseDateTime(value: string | undefined | null): string {
  if (!value) return '--'
  // Se contiver 'T'
  if (value.includes('T')) {
    const [d, t] = value.split('T')
    if (d && t) {
      // Se a data já estiver em DD/MM/YYYY
      if (d.includes('/')) {
        return `${d} às ${t}`
      }
      // Se a data estiver em YYYY-MM-DD
      if (d.includes('-')) {
        const parts = d.split('-')
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]} às ${t}`
        }
      }
      return `${d} às ${t}`
    }
  }
  return value
}


