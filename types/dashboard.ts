export interface LeaderboardEntry {
  referral: string
  totalFeesUSD: number
}

export interface ChartDataPoint {
  date: string
  cumulativeFees: number
  dailyFees: number
}

export interface AssetFlowData {
  symbol: string
  asset: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  inflowCount: number
  outflowCount: number
}

export interface ChainFlowData {
  chain: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  inflowCount: number
  outflowCount: number
}

export interface ProviderFlowData {
  provider: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  totalFeesUSD: number
  averageFeeBps: number
  transactionCount: number
}

export interface ProviderAssetFlowData {
  provider: string
  symbol: string
  asset: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  inflowCount: number
  outflowCount: number
}

export interface ProcessedData {
  leaderboard: LeaderboardEntry[]
  chartData: ChartDataPoint[]
  assetFlows: AssetFlowData[]
  chainFlows: ChainFlowData[]
  providerFlows: ProviderFlowData[]
  providerAssetFlows: ProviderAssetFlowData[]
  totalInflowUSD: number
  totalOutflowUSD: number
  totalFees: number
  totalReferrals: number
  lastUpdated: string
}

export type TimeHorizon = '7D' | '30D' | '90D' | 'ALL'

