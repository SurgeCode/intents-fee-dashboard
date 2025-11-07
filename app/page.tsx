"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, Bar, ComposedChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PixelGrid } from "@/components/ui/pixel-grid"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface LeaderboardEntry {
  referral: string
  totalFeesUSD: number
}

interface ChartDataPoint {
  date: string
  cumulativeFees: number
  dailyFees: number
}

interface AssetFlowData {
  symbol: string
  asset: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  inflowCount: number
  outflowCount: number
}

interface ChainFlowData {
  chain: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  inflowCount: number
  outflowCount: number
}

interface ProviderFlowData {
  provider: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  totalFeesUSD: number
  averageFeeBps: number
  transactionCount: number
}

interface ProviderAssetFlowData {
  provider: string
  symbol: string
  asset: string
  totalInflowUSD: number
  totalOutflowUSD: number
  netFlowUSD: number
  inflowCount: number
  outflowCount: number
}

interface ProcessedData {
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

const bucketUrl = 'https://storage.googleapis.com/bitte-public'
const tokensUrl = `${bucketUrl}/intents/tokens`
const chainsUrl = `${bucketUrl}/intents/chains`

export const TOKEN_ICONS: Record<string, string> = {
  BTC: `${tokensUrl}/btc_token.svg`,
  ETH: `${tokensUrl}/eth_token.svg`,
  NEAR: `${chainsUrl}/near.svg`,
  WNEAR: `${chainsUrl}/near.svg`,
  USDC: `${tokensUrl}/usdc_token.svg`,
  USDT: `${tokensUrl}/usdt_token.svg`,
  XDAI: `${tokensUrl}/xdai_token.svg`,
  DAI: `${tokensUrl}/xdai_token.svg`,
  SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
  REF: 'https://assets.coingecko.com/coins/images/18279/small/ref.png',
  FRAX: 'https://assets.coingecko.com/coins/images/13422/small/FRAX_icon.png',
  AURORA: '/aurora.svg',
  JAMBO: 'https://plum-necessary-chameleon-942.mypinata.cloud/ipfs/QmVBgYM7SoEwsg1pZgi8gW6ZNi8HoQ8NZPgo8pzSDSZrQw',
  ARB: 'https://s2.coinmarketcap.com/static/img/coins/128x128/11841.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  KNC: 'https://assets.coingecko.com/coins/images/947/small/kyber-logo.png',
  GMX: 'https://assets.coingecko.com/coins/images/18323/small/arbit.png',
  AAVE: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
  PEPE: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
  TRX: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
  ZEC: 'https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png',
  SUI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
  APT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/standard/cardano.png?1696502090',
  BLACKDRAGON: '/black_dragon.webp',
  SHITZU: '/shitzu.webp',
  PURGE: '/purge.png',
  ABG: '/abg.jpeg',
  KAITO: '/kaito.png',
  XBTC: `${tokensUrl}/btc_token.svg`,
  TURBO: 'https://assets.coingecko.com/coins/images/30117/standard/TurboMark-QL_200.png?1708079597',
  TRUMP: 'https://assets.coingecko.com/coins/images/53746/standard/trump.png?1737171561',
  MELANIA: 'https://assets.coingecko.com/coins/images/53775/standard/melania-meme.png?1737329885',
  WIF: "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428",
  WBTC: `${tokensUrl}/btc_token.svg`,
  CBBTC: `${tokensUrl}/btc_token.svg`,
  BRETT: 'https://assets.coingecko.com/coins/images/35529/standard/1000050750.png?1709031995',
  SWEAT: 'https://assets.coingecko.com/coins/images/25057/standard/fhD9Xs16_400x400.jpg?1696524208',
  USD1: 'https://assets.coingecko.com/coins/images/54977/standard/USD1_1000x1000_transparent.png?1749297002',
  MOG: 'https://assets.coingecko.com/coins/images/31059/standard/MOG_LOGO_200x200.png?1696529893',
  USDF: 'https://assets.coingecko.com/coins/images/54558/standard/ff_200_X_200.png?1740741076',
  GNO: 'https://assets.coingecko.com/coins/images/662/standard/logo_square_simple_300px.png?1696501854',
  SAFE: 'https://assets.coingecko.com/coins/images/27032/standard/Artboard_1_copy_8circle-1.png?1696526084',
  COW: 'https://assets.coingecko.com/coins/images/24384/small/cow.png',
  WETH: 'https://assets.coingecko.com/coins/images/2518/standard/weth.png?1696501626',
  RHEA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/37529.png',
  BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  POL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
  OP: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png',
  AVAX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  TON: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
  PUBLIC: 'https://ref-new-1.s3.amazonaws.com/token/a7bac0ba58cbef0d117c76d9869bc2e0.svg',
}

export const CHAIN_ICONS: Record<string, string> = {
  cardano: 'https://assets.coingecko.com/coins/images/975/standard/cardano.png?1696502090',
  eth: `${chainsUrl}/eth.svg`,
  ethereum: `${chainsUrl}/eth.svg`,
  base: `${chainsUrl}/base.svg`,
  arb: `${chainsUrl}/arbi.svg`,
  arbitrum: `${chainsUrl}/arbi.svg`,
  gnosis: `${chainsUrl}/gnosis.svg`,
  near: `${chainsUrl}/near.svg`,
  aptos: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png',
  polygon: `${chainsUrl}/polygon.svg`,
  matic: `${chainsUrl}/polygon.svg`,
  op: `${chainsUrl}/op.svg`,
  optimism: `${chainsUrl}/op.svg`,
  avax: `${chainsUrl}/avax.svg`,
  avalanche: `${chainsUrl}/avax.svg`,
  bnb: `${chainsUrl}/bnb.svg`,
  bsc: `${chainsUrl}/bnb.svg`,
  sol: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
  btc: `${tokensUrl}/btc_token.svg`,
  sui: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
  tron: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
  zec: "https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png",
  doge: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  xrp: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  bera: "https://assets.coingecko.com/coins/images/25235/standard/BERA.png?1738822008",
  kaito: "https://assets.coingecko.com/coins/images/13422/small/FRAX_icon.png",
  fms: "https://s2.coinmarketcap.com/static/img/coins/64x64/29540.png",
  usdf: "https://s2.coinmarketcap.com/static/img/coins/64x64/29755.png",
  usd1: "https://s2.coinmarketcap.com/static/img/coins/64x64/31017.png",
  pol: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
  ton: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
}

export default function Dashboard() {
  const [data, setData] = useState<ProcessedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())
  const [timeHorizon, setTimeHorizon] = useState<'7D' | '30D' | '90D' | 'ALL'>('ALL')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(
          "https://thvomwknsgnklfce.public.blob.vercel-storage.com/referral-fees-processed-KRY57Oar7h98zejOWjwxE69OZYQBvV.json",
        )
        const processedData: ProcessedData = await response.json()

        setData(processedData)
        setLoading(false)
      } catch (error) {
        console.error("[Dashboard] Error loading data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!data) return

    const now = new Date()
    let filteredData = data.chartData

    if (timeHorizon !== 'ALL') {
      const daysMap = { '7D': 7, '30D': 30, '90D': 90 }
      const days = daysMap[timeHorizon]
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filteredData = data.chartData.filter(item => new Date(item.date) >= cutoffDate)
    }

    const formattedChartData = filteredData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dailyFees: item.dailyFees,
      cumulativeFees: item.cumulativeFees,
    }))

    setChartData(formattedChartData)
  }, [data, timeHorizon])

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => {
      const next = new Set(prev)
      if (next.has(provider)) {
        next.delete(provider)
      } else {
        next.add(provider)
      }
      return next
    })
  }

  const getProviderAssets = (provider: string): ProviderAssetFlowData[] => {
    if (!data) return []
    return data.providerAssetFlows
      .filter(flow => flow.provider === provider)
      .sort((a, b) => (b.totalInflowUSD + b.totalOutflowUSD) - (a.totalInflowUSD + a.totalOutflowUSD))
      .slice(0, 10)
  }

  const getTokenIcon = (symbol: string): string | null => {
    return TOKEN_ICONS[symbol.toUpperCase()] || null
  }

  const getChainIcon = (chain: string): string | null => {
    return CHAIN_ICONS[chain.toLowerCase()] || null
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatLargeCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <>
        <PixelGrid 
          className="z-[-1]" 
          bgColor="#0a0a0a" 
          pixelColor="#252525"
          pixelSize={2}
          pixelSpacing={4}
        />
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="text-white/60 text-sm">Loading data...</div>
          </div>
        </div>
      </>
    )
  }

  if (!data) return null

  return (
    <>
      <PixelGrid 
        className="z-[-1]" 
        bgColor="#0a0a0a" 
        pixelColor="#252525"
        pixelSize={2}
        pixelSpacing={4}
      />
      <div className="min-h-screen bg-transparent text-white py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h1 className="text-5xl font-medium tracking-tight text-white">Near Intents Fee Dashboard</h1>
              <p className="text-[#888888] text-lg">This dashboard tracks fees, inflows, and outflows specifically for apps integrating NEAR intents via the 1 Click API. It does not reflect all intents volume. All data is sourced directly from the explorer API.</p>
            </div>
            <a
              href="https://x.com/surgecodes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a]/70 hover:bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#1a1a1a] rounded-lg transition-colors group"
            >
              <img
                src="https://pbs.twimg.com/profile_images/1957926435001163776/5fkiQIBz_400x400.jpg"
                alt="surgecodes"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-[#888888] group-hover:text-white transition-colors">
                Built by @surgecodes
              </span>
            </a>
          </div>

         
        
          <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)] transition-shadow">
            <CardHeader className="pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <CardDescription className="text-[#888888] text-sm font-normal mb-2">Cumulative Fees Over Time</CardDescription>
                  <CardTitle className="text-4xl font-semibold text-white">{formatCurrency(data.totalFees)}</CardTitle>
                </div>
                <div className="flex gap-2">
                  {(['7D', '30D', '90D', 'ALL'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeHorizon(period)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        timeHorizon === period
                          ? 'bg-white text-black'
                          : 'bg-[#1a1a1a] text-[#888888] hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-8">
              <ChartContainer
                config={{
                  cumulativeFees: {
                    label: "Cumulative Fees",
                    color: "#ffffff",
                  },
                  dailyFees: {
                    label: "Daily Fees",
                    color: "#1dd1a1",
                  },
                }}
                className="h-[320px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <XAxis
                      dataKey="date"
                      stroke="transparent"
                      tick={{ fill: "#666666", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="transparent"
                      tick={{ fill: "#666666", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="transparent"
                      tick={{ fill: "#666666", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 shadow-xl">
                            <p className="text-xs text-[#888888] mb-2">{payload[0].payload.date}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-white">Daily Fees:</span>
                                <span className="text-xs font-mono font-semibold text-emerald-400">
                                  {formatLargeCurrency(payload[0].payload.dailyFees)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-white">Cumulative:</span>
                                <span className="text-xs font-mono font-semibold text-white">
                                  {formatLargeCurrency(payload[0].payload.cumulativeFees)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="dailyFees"
                      fill="rgba(29, 209, 161, 0.2)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cumulativeFees"
                      stroke="#ffffff"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)] transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-white">Top Assets by Volume</CardTitle>
                <CardDescription className="text-[#888888] text-sm">Inflow vs outflow distribution</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {data.assetFlows.slice(0, 8).map((flow) => {
                  const icon = getTokenIcon(flow.symbol)
                  const total = flow.totalInflowUSD + flow.totalOutflowUSD
                  const inflowPercent = total > 0 ? (flow.totalInflowUSD / total) * 100 : 50
                  const outflowPercent = total > 0 ? (flow.totalOutflowUSD / total) * 100 : 50
                  
                  return (
                    <div key={flow.asset} className="relative h-11 flex w-full border-b border-[#1a1a1a] last:border-b-0">
                      <div 
                        className="flex items-center text-xs font-mono font-bold text-white relative border-r border-black/40"
                        style={{ width: `${inflowPercent}%`, backgroundColor: 'rgba(29, 209, 161, 0.15)', minWidth: '140px' }}
                      >
                        <div className="absolute left-3 flex items-center gap-2 pointer-events-none z-10">
                          {icon ? (
                            <img src={icon} alt={flow.symbol} className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <span className="text-xs text-white/60">{flow.symbol.slice(0, 2)}</span>
                          )}
                          <span className="text-sm font-semibold">{flow.symbol}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center pl-32">
                          {inflowPercent > 20 && formatCurrency(flow.totalInflowUSD)}
                        </div>
                      </div>
                      <div 
                        className="flex items-center justify-center text-xs font-mono font-bold text-white pl-2"
                        style={{ width: `${outflowPercent}%`, backgroundColor: 'rgba(192, 57, 43, 0.15)' }}
                      >
                        {outflowPercent > 15 && formatCurrency(flow.totalOutflowUSD)}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)] transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-white">Top Chains by Volume</CardTitle>
                <CardDescription className="text-[#888888] text-sm">Inflow vs outflow distribution</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {data.chainFlows.slice(0, 8).map((flow) => {
                  const icon = getChainIcon(flow.chain)
                  const total = flow.totalInflowUSD + flow.totalOutflowUSD
                  const inflowPercent = total > 0 ? (flow.totalInflowUSD / total) * 100 : 50
                  const outflowPercent = total > 0 ? (flow.totalOutflowUSD / total) * 100 : 50
                  
                  return (
                    <div key={flow.chain} className="relative h-11 flex w-full border-b border-[#1a1a1a] last:border-b-0">
                      <div 
                        className="flex items-center text-xs font-mono font-bold text-white relative border-r border-black/40"
                        style={{ width: `${inflowPercent}%`, backgroundColor: 'rgba(29, 209, 161, 0.15)', minWidth: '140px' }}
                      >
                        <div className="absolute left-3 flex items-center gap-2 pointer-events-none z-10">
                          {icon ? (
                            <img src={icon} alt={flow.chain} className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <span className="text-xs text-white/60">{flow.chain.slice(0, 2).toUpperCase()}</span>
                          )}
                          <span className="text-sm font-semibold capitalize">{flow.chain}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center pl-32">
                          {inflowPercent > 20 && formatCurrency(flow.totalInflowUSD)}
                        </div>
                      </div>
                      <div 
                        className="flex items-center justify-center text-xs font-mono font-bold text-white pl-2"
                        style={{ width: `${outflowPercent}%`, backgroundColor: 'rgba(192, 57, 43, 0.15)' }}
                      >
                        {outflowPercent > 15 && formatCurrency(flow.totalOutflowUSD)}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)] transition-shadow">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-medium text-white">Provider Leaderboard</CardTitle>
              <CardDescription className="text-[#888888] text-sm">Click to view asset flows</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <div className="w-8"></div>
                <div className="text-xs font-medium text-[#888888] uppercase tracking-wide">Provider</div>
                <div className="text-xs font-medium text-[#888888] uppercase tracking-wide text-center">Avg Fee</div>
                <div className="text-xs font-medium text-[#888888] uppercase tracking-wide text-right">Total Fees</div>
                <div className="w-4"></div>
              </div>
              <div>
                {data.leaderboard.map((entry, index) => {
                  const isExpanded = expandedProviders.has(entry.referral)
                  const providerAssets = getProviderAssets(entry.referral)
                  const providerFlow = data.providerFlows.find(p => p.provider === entry.referral)

                  return (
                    <Collapsible
                      key={entry.referral}
                      open={isExpanded}
                      onOpenChange={() => toggleProvider(entry.referral)}
                      className="group"
                    >
                      <CollapsibleTrigger className="w-full border-b border-[#151515] hover:bg-[#0f0f0f] transition-colors cursor-pointer">
                        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-5 items-center">
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                index === 0
                                  ? "bg-yellow-400/10 text-yellow-400"
                                  : index === 1
                                    ? "bg-slate-300/10 text-slate-300"
                                    : index === 2
                                      ? "bg-orange-400/10 text-orange-400"
                                      : "text-[#666666]"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <div className="text-white font-normal truncate">{entry.referral}</div>
                            {providerFlow && (
                              <div className="text-xs text-[#666666]">
                                {providerFlow.transactionCount} txns · {formatCurrency(providerFlow.totalInflowUSD + providerFlow.totalOutflowUSD)} vol
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            {providerFlow && providerFlow.averageFeeBps > 0 ? (
                              <div className="px-3 py-1.5 bg-[#1a1a1a] rounded-md">
                                <div className="text-sm font-mono font-semibold text-emerald-400">
                                  {(providerFlow.averageFeeBps / 100).toFixed(2)}%
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-[#666666]">-</div>
                            )}
                          </div>
                          <div className={`flex items-center font-mono text-sm ${entry.totalFeesUSD === 0 ? 'text-[#666666]' : 'text-white'}`}>
                            {formatLargeCurrency(entry.totalFeesUSD)}
                          </div>
                          <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {providerAssets.length > 0 ? (
                          <>
                            {providerAssets.map((flow) => {
                              const icon = getTokenIcon(flow.symbol)
                              const total = flow.totalInflowUSD + flow.totalOutflowUSD
                              const inflowPercent = total > 0 ? (flow.totalInflowUSD / total) * 100 : 50
                              const outflowPercent = total > 0 ? (flow.totalOutflowUSD / total) * 100 : 50
                              
                              return (
                                <div key={`${flow.provider}-${flow.asset}`} className="relative h-11 flex w-full border-b border-[#151515]">
                                  <div 
                                    className="flex items-center text-[10px] font-mono font-bold text-white relative border-r border-black/40"
                                    style={{ width: `${inflowPercent}%`, backgroundColor: 'rgba(29, 209, 161, 0.1)', minWidth: '140px' }}
                                  >
                                    <div className="absolute left-6 flex items-center gap-2 pointer-events-none z-10">
                                      {icon ? (
                                        <img src={icon} alt={flow.symbol} className="w-4 h-4 flex-shrink-0" />
                                      ) : (
                                        <span className="text-[10px] text-white/60">{flow.symbol.slice(0, 2)}</span>
                                      )}
                                      <span className="text-xs font-semibold">{flow.symbol}</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center pl-36">
                                      {inflowPercent > 25 && formatCurrency(flow.totalInflowUSD)}
                                    </div>
                                  </div>
                                  <div 
                                    className="flex items-center justify-center text-[10px] font-mono font-bold text-white pl-2"
                                    style={{ width: `${outflowPercent}%`, backgroundColor: 'rgba(192, 57, 43, 0.1)' }}
                                  >
                                    {outflowPercent > 20 && formatCurrency(flow.totalOutflowUSD)}
                                  </div>
                                </div>
                              )
                            })}
                          </>
                        ) : (
                          <div className="text-xs text-[#666666] text-center py-4 border-b border-[#151515]">No asset flow data</div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
