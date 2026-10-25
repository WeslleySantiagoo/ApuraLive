export interface CandidateResult {
  id: string
  number: string
  name: string
  color: string
  votes: number
  percentage: number
  is_elected: boolean
  photo_url?: string | null
}

export interface SectionsProgress {
  total: number
  counted: number
  percentage: number
}

export interface VotesSummary {
  valid: number
  blank: number
  null_votes: number
  abstention: number
  total_electors: number
}

export interface NormalizedElectionResult {
  scope: string
  scope_name?: string
  updated_at: string
  source_updated_at?: string | null
  status: 'available' | 'waiting_publication' | 'unavailable'
  total_valid_votes: number
  sections: SectionsProgress
  votes_summary?: VotesSummary | null
  candidates: CandidateResult[]
  remaining_valid_votes_estimate: number
}

export interface IrreversibilityResponse {
  is_mathematically_irreversible: boolean
  round_type: number
  leader_candidate_id?: string | null
  leader_candidate_name?: string | null
  vote_difference: number
  remaining_valid_votes_upper_bound: number
  votes_needed_to_win: number
  target_threshold: number
  summary_text: string
  assessed_at: string
}
