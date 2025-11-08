"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, Bar, ComposedChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PixelGrid } from "@/components/ui/pixel-grid"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { formatCurrency, formatLargeCurrency } from "@/lib/utils"
import { getTokenIcon, getChainIcon } from "@/constants/icons"
import type { ProcessedData, TimeHorizon, ProviderAssetFlowData } from "@/types/dashboard"

const DATA_URL = "https://thvomwknsgnklfce.public.blob.vercel-storage.com/referral-fees-processed-61tdfci1pyhMgmVOpnVZgt01nGuc0D.json"

export default function Dashboard() {
  const [data, setData] = useState<ProcessedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('ALL')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(DATA_URL)
        if (!response.ok) throw new Error('Failed to fetch data')
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
      next.has(provider) ? next.delete(provider) : next.add(provider)
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

  if (loading) {
    return (
      <>
        <PixelGrid className="z-[-1]" bgColor="#0a0a0a" pixelColor="#252525" pixelSize={2} pixelSpacing={4} />
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
      <PixelGrid className="z-[-1]" bgColor="#0a0a0a" pixelColor="#252525" pixelSize={2} pixelSpacing={4} />
      <div className="min-h-screen bg-transparent text-white py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h1 className="text-5xl font-medium tracking-tight text-white">Near Intents Fee Dashboard</h1>
              <p className="text-[#888888] text-lg">
                This dashboard tracks fees, inflows, and outflows specifically for apps integrating NEAR intents via the 1 Click API. It does not reflect all intents volume. All data is sourced directly from the explorer API.
              </p>
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
                        timeHorizon === period ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#888888] hover:text-white'
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
                  cumulativeFees: { label: "Cumulative Fees", color: "#ffffff" },
                  dailyFees: { label: "Daily Fees", color: "#1dd1a1" },
                }}
                className="h-[320px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <XAxis dataKey="date" stroke="transparent" tick={{ fill: "#666666", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="transparent" tick={{ fill: "#666666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" stroke="transparent" tick={{ fill: "#666666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
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
                    <Bar yAxisId="right" dataKey="dailyFees" fill="rgba(29, 209, 161, 0.2)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="cumulativeFees" stroke="#ffffff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)] transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-white">Top Assets by Volume</CardTitle>
                <CardDescription className="text-[#888888] text-sm">Green = deposited into intents · Red = withdrawn from intents</CardDescription>
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
                <CardDescription className="text-[#888888] text-sm">Green = deposited into intents · Red = withdrawn from intents</CardDescription>
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
              <CardDescription className="text-[#888888] text-sm">Click any row to view asset deposit/withdrawal flows</CardDescription>
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
                    <Collapsible key={entry.referral} open={isExpanded} onOpenChange={() => toggleProvider(entry.referral)} className="group">
                      <CollapsibleTrigger className="w-full border-b border-[#151515] hover:bg-[#0f0f0f] transition-colors cursor-pointer">
                        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-5 items-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                              index === 0 ? "bg-yellow-400/10 text-yellow-400" :
                              index === 1 ? "bg-slate-300/10 text-slate-300" :
                              index === 2 ? "bg-orange-400/10 text-orange-400" : "text-[#666666]"
                            }`}
                          >
                            {index + 1}
                          </span>
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
